import asyncio
import json
import random
import os
import sys

from import_json import import_questions_from_json

BASE_TEMPLATES = [
    {
        "title": "Sum of Two Numbers",
        "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
        "difficulty": "easy",
        "topics": ["arrays", "two_pointers"],
        "companies": ["Google", "Amazon", "Apple"],
        "tags": ["hash-table", "math"],
        "solution_approach": "Use a hash map to store the difference between the target and the current element.",
        "python_solution": "def twoSum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n    return []",
        "java_solution": "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[] {};\n    }\n}"
    },
    {
        "title": "Reverse Linked List",
        "description": "Given the head of a singly linked list, reverse the list, and return the reversed list.",
        "difficulty": "easy",
        "topics": ["linked_lists"],
        "companies": ["Microsoft", "Bloomberg"],
        "tags": ["recursion", "pointers"],
        "solution_approach": "Iterate through the list, keeping track of the previous node and changing the current node's next pointer to the previous node.",
        "python_solution": "def reverseList(head):\n    prev = None\n    curr = head\n    while curr:\n        next_temp = curr.next\n        curr.next = prev\n        prev = curr\n        curr = next_temp\n    return prev",
        "java_solution": "class Solution {\n    public ListNode reverseList(ListNode head) {\n        ListNode prev = null;\n        ListNode curr = head;\n        while (curr != null) {\n            ListNode nextTemp = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = nextTemp;\n        }\n        return prev;\n    }\n}"
    },
    {
        "title": "Valid Parentheses",
        "description": "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        "difficulty": "easy",
        "topics": ["stacks", "strings"],
        "companies": ["Amazon", "LinkedIn"],
        "tags": ["parsing"],
        "solution_approach": "Use a stack to push opening brackets. When a closing bracket is encountered, pop the top of the stack and check if it matches.",
        "python_solution": "def isValid(s):\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack",
        "java_solution": "class Solution {\n    public boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') stack.push(')');\n            else if (c == '{') stack.push('}');\n            else if (c == '[') stack.push(']');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n}"
    },
    {
        "title": "Merge Intervals",
        "description": "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.",
        "difficulty": "medium",
        "topics": ["arrays", "greedy"],
        "companies": ["Google", "Facebook", "Microsoft"],
        "tags": ["sorting"],
        "solution_approach": "Sort the intervals by their start times, then iterate and merge if the start time of the current is less than or equal to the end time of the previous.",
        "python_solution": "def merge(intervals):\n    intervals.sort(key=lambda x: x[0])\n    merged = []\n    for interval in intervals:\n        if not merged or merged[-1][1] < interval[0]:\n            merged.append(interval)\n        else:\n            merged[-1][1] = max(merged[-1][1], interval[1])\n    return merged",
        "java_solution": "class Solution {\n    public int[][] merge(int[][] intervals) {\n        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));\n        List<int[]> merged = new ArrayList<>();\n        for (int[] interval : intervals) {\n            if (merged.isEmpty() || merged.get(merged.size() - 1)[1] < interval[0]) {\n                merged.add(interval);\n            } else {\n                merged.get(merged.size() - 1)[1] = Math.max(merged.get(merged.size() - 1)[1], interval[1]);\n            }\n        }\n        return merged.toArray(new int[merged.size()][]);\n    }\n}"
    },
    {
        "title": "Longest Increasing Subsequence",
        "description": "Given an integer array nums, return the length of the longest strictly increasing subsequence.",
        "difficulty": "medium",
        "topics": ["dynamic_programming", "arrays"],
        "companies": ["Amazon", "Microsoft"],
        "tags": ["binary-search"],
        "solution_approach": "Use dynamic programming to store the longest increasing subsequence ending at each index, or use binary search with a patience sorting approach for O(n log n).",
        "python_solution": "def lengthOfLIS(nums):\n    dp = [1] * len(nums)\n    for i in range(len(nums)):\n        for j in range(i):\n            if nums[i] > nums[j]:\n                dp[i] = max(dp[i], dp[j] + 1)\n    return max(dp) if nums else 0",
        "java_solution": "class Solution {\n    public int lengthOfLIS(int[] nums) {\n        if (nums.length == 0) return 0;\n        int[] dp = new int[nums.length];\n        Arrays.fill(dp, 1);\n        int max = 1;\n        for (int i = 1; i < nums.length; i++) {\n            for (int j = 0; j < i; j++) {\n                if (nums[i] > nums[j]) {\n                    dp[i] = Math.max(dp[i], dp[j] + 1);\n                }\n            }\n            max = Math.max(max, dp[i]);\n        }\n        return max;\n    }\n}"
    }
]

def generate_questions(count=200):
    questions = []
    modifiers = ["in a Matrix", "with duplicates", "in O(n) time", "using constant space", "II", "III", "IV", "V", "Advanced"]
    
    for i in range(count):
        base = random.choice(BASE_TEMPLATES)
        
        # Determine if it's the original or a variant
        is_original = i < len(BASE_TEMPLATES)
        if is_original:
            title = base["title"]
        else:
            title = f"{base['title']} {random.choice(modifiers)} - Variant {i}"
            
        q = {
            "title": title,
            "description": base["description"] + f"\n\nVariant specific note: Handle edge cases appropriate for variant {i}.",
            "difficulty": base["difficulty"],
            "topics": base["topics"],
            "companies": random.sample(base["companies"] + ["Netflix", "Uber", "Lyft", "Stripe", "Airbnb"], k=random.randint(1, 3)),
            "tags": base["tags"],
            "constraints": "1 <= nums.length <= 10^4\n-10^4 <= nums[i] <= 10^4",
            "solution_approach": base["solution_approach"],
            "python_solution": base["python_solution"],
            "java_solution": base["java_solution"],
            "frequency_score": round(random.uniform(0.1, 0.99), 2),
            "is_premium": random.random() > 0.8,
            "examples": [
                {
                    "input": "Example input",
                    "output": "Example output",
                    "explanation": "Example explanation"
                }
            ],
            "hints": [
                {"level": 1, "content": "Think about the naive approach first."},
                {"level": 2, "content": f"Consider using {base['topics'][0]} to optimize."},
                {"level": 3, "content": base["solution_approach"]}
            ]
        }
        questions.append(q)
    return questions

async def main():
    print("Generating 200 mock questions...")
    questions = generate_questions(200)
    
    output_path = os.path.join(os.path.dirname(__file__), "seed_data.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump({"questions": questions}, f, indent=2)
        
    print(f"Saved {len(questions)} questions to {output_path}")
    print("Importing into MongoDB...")
    
    await import_questions_from_json(output_path)

if __name__ == "__main__":
    asyncio.run(main())
