EXPLAIN_PROMPT = """
You are an expert Senior Software Engineer and competitive programmer.
Explain the following Data Structures and Algorithms (DSA) problem conceptually.
Do not provide a full code solution. Focus on the core logic, intuition, and optimal approach.

Problem Title: {title}
Difficulty: {difficulty}
Topics: {topics}

Description:
{description}

Constraints:
{constraints}

Provide your explanation in Markdown format, breaking it down into:
1. Understanding the Problem
2. Key Observations / Intuition
3. Optimal Strategy
4. Time and Space Complexity
5. Common Mistakes / Pitfalls
"""

HINT_LEVEL_1_PROMPT = """
You are a helpful technical interviewer.
Provide a vague, conceptual nudge (Hint Level 1) for the following problem.
Do not reveal the data structure or algorithm directly. Help the candidate think in the right direction.

Problem: {title}
Description: {description}

Hint (1-2 sentences):
"""

HINT_LEVEL_2_PROMPT = """
You are a helpful technical interviewer.
Provide an algorithmic clue (Hint Level 2) for the following problem.
You can mention the specific data structure or algorithmic pattern (e.g., "monotonic stack", "sliding window", "DFS") and roughly why it applies.

Problem: {title}
Description: {description}

Hint (2-3 sentences):
"""

HINT_LEVEL_3_PROMPT = """
You are a helpful technical interviewer.
Provide a clear approach skeleton (Hint Level 3) for the following problem.
Outline the concrete steps to solve it without writing actual code. Use bullet points if helpful.

Problem: {title}
Description: {description}

Hint (Detailed steps):
"""

REVIEW_APPROACH_PROMPT = """
You are a technical interviewer evaluating a candidate's proposed approach to a problem.

Problem: {title}
Description: {description}

Candidate's Proposed Approach:
{user_text}

Provide structured feedback in Markdown format:
1. Correctness: Will this approach work? (Yes/No/Partially)
2. Efficiency: Is the time and space complexity optimal? What are they?
3. Edge Cases: Are there any edge cases the candidate might have missed?
4. Improvement: How can they improve this approach?
"""

RECOMMEND_PROMPT = """
Based on the following topics: {topics} and difficulty: {difficulty}.
Suggest 5 unique programming interview problem topics or patterns that a candidate should study next.
Do not include the following excluded problem slugs: {exclude_slugs}.

Return ONLY a JSON array of strings, where each string is a brief descriptive topic or pattern name.
"""

ROADMAP_PROMPT = """
You are an expert technical recruiter and interviewer.
Create a structured 4-week interview preparation roadmap for {company}.
The candidate is preparing for a Software Engineer role.

Provide the roadmap in Markdown format.
Include:
- High-level focus areas for {company} (e.g., specific algorithms or systems design focus).
- Week-by-week breakdown with specific problem patterns to study.
- Tips specific to {company}'s interview culture (e.g., Leadership Principles for Amazon).
"""
