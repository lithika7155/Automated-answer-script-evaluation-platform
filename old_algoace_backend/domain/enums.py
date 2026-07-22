from enum import Enum


class DSATopic(str, Enum):
    DYNAMIC_PROGRAMMING = "dynamic_programming"
    GREEDY = "greedy"
    BACKTRACKING = "backtracking"
    DIVIDE_AND_CONQUER = "divide_and_conquer"
    TWO_POINTERS = "two_pointers"
    GRAPHS = "graphs"
    TREES = "trees"
    ARRAYS = "arrays"
    STRINGS = "strings"
    LINKED_LISTS = "linked_lists"
    STACKS = "stacks"
    QUEUES = "queues"


class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class SortField(str, Enum):
    FREQUENCY = "frequency_score"
    CREATED_AT = "created_at"
    DIFFICULTY = "difficulty"
    TITLE = "title"


# Difficulty ordering for sort (used in aggregation pipelines)
DIFFICULTY_ORDER = {
    Difficulty.EASY: 1,
    Difficulty.MEDIUM: 2,
    Difficulty.HARD: 3,
}

KNOWN_COMPANIES = [
    "Google", "Amazon", "Microsoft", "Apple", "Meta", "Netflix",
    "Adobe", "Uber", "Lyft", "Twitter", "LinkedIn", "Salesforce",
    "Oracle", "IBM", "Intel", "Nvidia", "Snap", "Airbnb", "Stripe",
    "Coinbase", "Atlassian", "Shopify", "Twilio", "Databricks",
    "Palantir", "Bloomberg", "Goldman Sachs", "Morgan Stanley",
    "Citadel", "Two Sigma", "Jane Street",
]
