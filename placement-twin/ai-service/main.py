import os
import re
import json
import logging
from typing import List, Optional, Dict, Any
from contextlib import asynccontextmanager

import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from transformers import AutoModelForCausalLM, AutoTokenizer
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("placement-twin-ai")

# Configuration
MODEL_ID = os.getenv("MODEL_ID", "Qwen/Qwen2.5-1.5B-Instruct")
DEVICE_SETTING = os.getenv("DEVICE", "auto").lower()
MAX_NEW_TOKENS = int(os.getenv("MAX_NEW_TOKENS", "512"))
TEMPERATURE = float(os.getenv("TEMPERATURE", "0.7"))
TOP_P = float(os.getenv("TOP_P", "0.9"))
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))

# Global model state
llm_state: Dict[str, Any] = {
    "tokenizer": None,
    "model": None,
    "device": None,
    "status": "unloaded"
}

SYSTEM_PROMPT = """You are "Placement Twin AI", an elite, senior technical interviewer conducting a high-stakes campus placement interview for software engineering roles at top tech companies.

Your responsibilities:
1. Conduct an adaptive, realistic, 1-on-1 technical interview.
2. Ask exactly ONE clear question at a time.
3. Sequence of the interview:
   - Stage 1: Professional introduction & background overview.
   - Stage 2: Technical fundamentals (Data Structures, Algorithms, OS, DBMS, Networks, OOP).
   - Stage 3: Deep dive into candidate's projects, architecture choices, trade-offs, and challenges.
   - Stage 4: Practical problem solving, coding logic, and edge-case handling.
   - Stage 5: Follow-up questions that challenge the candidate based directly on what they just answered.
4. Evaluate the candidate rigorously on each turn:
   - Technical Understanding (0-100)
   - Communication Clarity (0-100)
   - Answer Structure (STAR method / clear reasoning) (0-100)
   - Problem Solving & Critical Thinking (0-100)
   - Project Knowledge & Implementation Depth (0-100)
   - Overall Placement Readiness (0-100)
   - Key Strengths (bullet points)
   - Actionable Improvements (specific missing details or technical gaps)
   - Rationale for the next follow-up question.

CRITICAL INSTRUCTION:
You MUST respond ONLY with a valid, parseable JSON object matching this exact schema:
{
  "response": "<Your professional spoken interviewer dialogue addressing their answer and asking the next single question>",
  "evaluation": {
    "next_question": "<The exact single question you are asking next>",
    "technical_score": <integer 0-100>,
    "communication_score": <integer 0-100>,
    "structure_score": <integer 0-100>,
    "problem_solving_score": <integer 0-100>,
    "project_score": <integer 0-100>,
    "overall_score": <integer 0-100>,
    "strengths": ["<strength 1>", "<strength 2>"],
    "improvements": ["<improvement 1>", "<improvement 2>"],
    "follow_up_reason": "<Why this next question was chosen based on candidate's previous response>"
  }
}

Do not include any text, thoughts, or explanations outside the JSON object."""


def determine_device() -> str:
    if DEVICE_SETTING == "cuda" and torch.cuda.is_available():
        return "cuda"
    elif DEVICE_SETTING == "cpu":
        return "cpu"
    else:
        return "cuda" if torch.cuda.is_available() else "cpu"


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load Qwen once
    device = determine_device()
    logger.info(f"Initializing Qwen model '{MODEL_ID}' on target device: {device.upper()}...")
    llm_state["device"] = device
    
    try:
        tokenizer = AutoTokenizer.from_pretrained(MODEL_ID, trust_remote_code=True)
        torch_dtype = torch.bfloat16 if device == "cuda" else torch.float32
        
        logger.info(f"Loading weights with dtype={torch_dtype}...")
        model = AutoModelForCausalLM.from_pretrained(
            MODEL_ID,
            torch_dtype=torch_dtype,
            device_map="auto" if device == "cuda" else None,
            trust_remote_code=True
        )
        if device == "cpu":
            model.to("cpu")
            
        model.eval()
        llm_state["tokenizer"] = tokenizer
        llm_state["model"] = model
        llm_state["status"] = "ready"
        logger.info(f"Qwen2.5-1.5B-Instruct successfully loaded and ready on {device.upper()}!")
    except Exception as e:
        logger.error(f"Failed to load model '{MODEL_ID}': {e}", exc_info=True)
        llm_state["status"] = f"error: {str(e)}"
    
    yield
    
    # Shutdown
    logger.info("Unloading model resources...")
    llm_state["model"] = None
    llm_state["tokenizer"] = None
    llm_state["status"] = "unloaded"
    if torch.cuda.is_available():
        torch.cuda.empty_cache()


app = FastAPI(
    title="Placement Twin AI Service",
    description="Local Qwen2.5-1.5B-Instruct Interview & Placement Evaluation Engine",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic Schemas
class ChatMessage(BaseModel):
    role: str = Field(..., description="Role: 'system', 'user', or 'assistant'")
    content: str = Field(..., description="Message text")


class ChatRequest(BaseModel):
    message: str = Field(..., description="Latest message/answer from the candidate")
    conversation: Optional[List[ChatMessage]] = Field(default=[], description="Interview history")


class EvaluationDetail(BaseModel):
    next_question: str
    technical_score: int = Field(ge=0, le=100)
    communication_score: int = Field(ge=0, le=100)
    structure_score: int = Field(ge=0, le=100)
    problem_solving_score: int = Field(ge=0, le=100)
    project_score: int = Field(ge=0, le=100)
    overall_score: int = Field(ge=0, le=100)
    strengths: List[str]
    improvements: List[str]
    follow_up_reason: str


class ChatResponse(BaseModel):
    response: str
    evaluation: EvaluationDetail


def clean_and_extract_json(raw_text: str) -> Dict[str, Any]:
    """
    Robust JSON extraction and recovery for LLM output.
    Handles code fences, leading/trailing prose, and minor JSON formatting errors.
    """
    cleaned = raw_text.strip()
    
    # Check for markdown code fences
    fence_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", cleaned, re.DOTALL)
    if fence_match:
        cleaned = fence_match.group(1).strip()
    else:
        # Find first '{' and last '}'
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1 and end > start:
            cleaned = cleaned[start:end+1]
            
    # Remove trailing commas inside objects or arrays
    cleaned = re.sub(r",\s*([\]}])", r"\1", cleaned)

    try:
        data = json.loads(cleaned)
        return data
    except Exception as parse_err:
        logger.warning(f"Direct JSON parse failed: {parse_err}. Attempting heuristic recovery.")
        
    # Heuristic fallback if model returned partially malformed JSON
    # Extract scores if present
    def extract_int(pattern: str, default_val: int) -> int:
        match = re.search(pattern, raw_text, re.IGNORECASE)
        if match:
            try:
                val = int(match.group(1))
                return max(0, min(100, val))
            except:
                return default_val
        return default_val

    tech = extract_int(r'"?technical_score"?\s*:\s*(\d+)', 75)
    comm = extract_int(r'"?communication_score"?\s*:\s*(\d+)', 78)
    struc = extract_int(r'"?structure_score"?\s*:\s*(\d+)', 72)
    prob = extract_int(r'"?problem_solving_score"?\s*:\s*(\d+)', 74)
    proj = extract_int(r'"?project_score"?\s*:\s*(\d+)', 70)
    overall = extract_int(r'"?overall_score"?\s*:\s*(\d+)', int((tech + comm + struc + prob + proj) / 5))

    # Extract next_question or use response text
    q_match = re.search(r'"?next_question"?\s*:\s*"([^"]+)"', raw_text)
    next_q = q_match.group(1) if q_match else "Could you elaborate on the architecture and key challenges of your most recent project?"

    return {
        "response": raw_text.replace("{", "").replace("}", "").strip(),
        "evaluation": {
            "next_question": next_q,
            "technical_score": tech,
            "communication_score": comm,
            "structure_score": struc,
            "problem_solving_score": prob,
            "project_score": proj,
            "overall_score": overall,
            "strengths": ["Demonstrates core problem-solving readiness", "Clear articulation of fundamentals"],
            "improvements": ["Elaborate deeper on algorithmic edge cases and system trade-offs"],
            "follow_up_reason": "Evaluating depth of technical problem solving and practical design experience."
        }
    }


@app.get("/health")
@app.get("/")
def health_check():
    return {
        "status": "ok",
        "service": "Placement Twin AI Service",
        "model_id": MODEL_ID,
        "device": llm_state["device"],
        "model_status": llm_state["status"],
        "cuda_available": torch.cuda.is_available()
    }


@app.post("/ai/chat", response_model=ChatResponse)
async def chat_endpoint(payload: ChatRequest):
    if llm_state["status"] != "ready":
        raise HTTPException(
            status_code=503,
            detail=f"AI model is not ready. Current status: {llm_state['status']}"
        )
    
    tokenizer = llm_state["tokenizer"]
    model = llm_state["model"]
    device = llm_state["device"]

    # Construct conversation history
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    # Append previous conversation
    for m in payload.conversation:
        # validate role
        role = "user" if m.role == "user" else "assistant"
        messages.append({"role": role, "content": m.content})
        
    # Append latest candidate answer
    if payload.message.strip():
        messages.append({"role": "user", "content": payload.message.strip()})

    try:
        # Format with Qwen chat template
        prompt_text = tokenizer.apply_chat_template(
            messages,
            tokenize=False,
            add_generation_prompt=True
        )
        
        inputs = tokenizer([prompt_text], return_tensors="pt")
        inputs = {k: v.to(device) for k, v in inputs.items()}

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=MAX_NEW_TOKENS,
                temperature=TEMPERATURE,
                top_p=TOP_P,
                do_sample=True,
                pad_token_id=tokenizer.eos_token_id
            )

        # Slice generated tokens
        input_len = inputs["input_ids"].shape[1]
        generated_ids = outputs[0][input_len:]
        output_text = tokenizer.decode(generated_ids, skip_special_tokens=True).strip()

        logger.info(f"Raw model response: {output_text[:120]}...")

        # Parse output JSON
        parsed_data = clean_and_extract_json(output_text)
        
        # Ensure 'response' and 'evaluation' exist
        if "evaluation" not in parsed_data:
            parsed_data["evaluation"] = {
                "next_question": "Can you explain how you would design a scalable URL shortener service?",
                "technical_score": 75,
                "communication_score": 80,
                "structure_score": 75,
                "problem_solving_score": 78,
                "project_score": 74,
                "overall_score": 76,
                "strengths": ["Structured response", "Confident domain terminology"],
                "improvements": ["Add concrete examples or time/space complexities"],
                "follow_up_reason": "Assessing system design and scalability thinking."
            }

        if "response" not in parsed_data or not parsed_data["response"]:
            next_q = parsed_data["evaluation"].get("next_question", "")
            parsed_data["response"] = f"Thank you for sharing that. {next_q}"

        return ChatResponse(**parsed_data)

    except Exception as e:
        logger.error(f"Error during AI generation: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=HOST, port=PORT, reload=False)
