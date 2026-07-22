from collections import defaultdict
from typing import List, Optional
from app.application.dtos.analytics import (
    ExamAnalyticsDTO,
    OverallPlatformSummaryDTO,
    QuestionDistributionDTO,
)
from app.domain.interfaces.evaluation_repository import IEvaluationRepository
from app.domain.services.grading_service import GradingService


class GetExamAnalyticsUseCase:
    def __init__(self, eval_repository: IEvaluationRepository):
        self.eval_repository = eval_repository

    async def execute_for_exam(self, exam_id: str) -> ExamAnalyticsDTO:
        evaluations = await self.eval_repository.list_all(exam_id=exam_id)
        if not evaluations:
            return ExamAnalyticsDTO(
                exam_id=exam_id,
                total_students_evaluated=0,
                highest_score=0.0,
                lowest_score=0.0,
                average_score=0.0,
                average_percentage=0.0,
                pass_count=0,
                fail_count=0,
                pass_percentage=0.0,
                question_distribution=[],
            )

        scores = [ev.total_score for ev in evaluations]
        percentages = [ev.percentage for ev in evaluations]
        highest = max(scores)
        lowest = min(scores)
        avg_score = round(sum(scores) / len(scores), 2)
        avg_pct = round(sum(percentages) / len(percentages), 2)

        pass_count = 0
        fail_count = 0
        for ev in evaluations:
            _, status = GradingService.calculate_grade_and_status(ev.percentage)
            if status.value == "Pass":
                pass_count += 1
            else:
                fail_count += 1

        pass_pct = round((pass_count / len(evaluations)) * 100.0, 2)

        q_stats = defaultdict(list)
        for ev in evaluations:
            for q in ev.question_evaluations:
                q_stats[q.question_number].append(q)

        q_distribution = []
        for q_num, q_list in q_stats.items():
            max_m = q_list[0].max_marks if q_list else 0.0
            avg_m = round(sum(q.marks_obtained for q in q_list) / len(q_list), 2)
            avg_rel = round(sum(q.relevance_score for q in q_list) / len(q_list), 2)
            avg_comp = round(sum(q.completeness_score for q in q_list) / len(q_list), 2)

            q_distribution.append(
                QuestionDistributionDTO(
                    question_number=q_num,
                    max_marks=max_m,
                    average_marks_obtained=avg_m,
                    average_relevance=avg_rel,
                    average_completeness=avg_comp,
                )
            )

        return ExamAnalyticsDTO(
            exam_id=exam_id,
            total_students_evaluated=len(evaluations),
            highest_score=highest,
            lowest_score=lowest,
            average_score=avg_score,
            average_percentage=avg_pct,
            pass_count=pass_count,
            fail_count=fail_count,
            pass_percentage=pass_pct,
            question_distribution=q_distribution,
        )

    async def execute_overall_summary(self) -> OverallPlatformSummaryDTO:
        evaluations = await self.eval_repository.list_all()
        if not evaluations:
            return OverallPlatformSummaryDTO(
                total_evaluations=0,
                total_exams=0,
                overall_average_percentage=0.0,
                total_passed=0,
                total_failed=0,
                overall_pass_rate=0.0,
            )

        exams = set(ev.exam_id for ev in evaluations)
        percentages = [ev.percentage for ev in evaluations]
        avg_pct = round(sum(percentages) / len(percentages), 2)

        passed = 0
        failed = 0
        for ev in evaluations:
            _, status = GradingService.calculate_grade_and_status(ev.percentage)
            if status.value == "Pass":
                passed += 1
            else:
                failed += 1

        pass_rate = round((passed / len(evaluations)) * 100.0, 2)

        return OverallPlatformSummaryDTO(
            total_evaluations=len(evaluations),
            total_exams=len(exams),
            overall_average_percentage=avg_pct,
            total_passed=passed,
            total_failed=failed,
            overall_pass_rate=pass_rate,
        )
