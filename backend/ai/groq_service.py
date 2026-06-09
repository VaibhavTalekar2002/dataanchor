from groq import Groq
import json

def get_ai_insights(results: dict, groq_key: str) -> dict:
    try:
        client = Groq(api_key=groq_key)

        # Build summary of issues for the prompt
        issues = []
        for check, data in results.get("results", {}).items():
            if data.get("status") != "PASS":
                issues.append(f"- {check.replace('_', ' ').upper()}: Score {data.get('score')}% — {data.get('status')}")

        if not issues:
            return {
                "summary": "All validation checks passed successfully. Your migration looks clean with no issues detected.",
                "recommendations": []
            }

        issues_text = "\n".join(issues)
        overall_score = results.get("overall_score", 0)

        prompt = f"""You are a data migration expert. Analyze these validation results and provide insights.

Overall Migration Health Score: {overall_score}%

Issues Found:
{issues_text}

Provide:
1. A 2-3 sentence plain English summary of what went wrong
2. A list of 2-4 specific fix recommendations

Respond in this exact JSON format:
{{
    "summary": "your summary here",
    "recommendations": [
        "recommendation 1",
        "recommendation 2"
    ]
}}

Return ONLY valid JSON, no extra text."""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=500
        )

        content = response.choices[0].message.content.strip()
        return json.loads(content)

    except json.JSONDecodeError:
        return {
            "summary": "AI analysis completed but response could not be parsed.",
            "recommendations": ["Please review the validation results manually."]
        }
    except Exception as e:
        return {
            "summary": f"AI analysis unavailable: {str(e)}",
            "recommendations": []
        }