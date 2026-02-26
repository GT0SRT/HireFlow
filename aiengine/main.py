from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI(title="HireFlow AI Engine", version="0.1.0")

app.add_middleware(
	CORSMiddleware,
	allow_origins=["*"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.get("/")
def root() -> dict[str, str]:
	return {"message": "AI Engine is running"}


@app.get("/health")
def health() -> dict[str, str]:
	return {"status": "ok"}


@app.post("/api/v1/analyze")
def analyze(payload: dict) -> dict:
	text = str(payload.get("text", ""))
	return {
		"received": True,
		"length": len(text),
		"preview": text[:120],
	}
