import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

from app.domain.models.evaluation import EvaluationResult
from app.domain.services.grading_service import GradingService


class PDFReportGenerator:
    """ReportLab PDF Generator for Evaluation Results."""

    @staticmethod
    def generate_evaluation_pdf(evaluation: EvaluationResult) -> bytes:
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36,
        )

        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            "TitleStyle",
            parent=styles["Heading1"],
            fontSize=20,
            leading=24,
            textColor=colors.HexColor("#1E293B"),
            alignment=0,
            spaceAfter=12,
        )
        subtitle_style = ParagraphStyle(
            "SubTitleStyle",
            parent=styles["Normal"],
            fontSize=11,
            leading=14,
            textColor=colors.HexColor("#64748B"),
            spaceAfter=18,
        )
        heading2 = ParagraphStyle(
            "Heading2Style",
            parent=styles["Heading2"],
            fontSize=14,
            leading=18,
            textColor=colors.HexColor("#0F172A"),
            spaceBefore=12,
            spaceAfter=8,
        )
        body = ParagraphStyle(
            "BodyStyle",
            parent=styles["Normal"],
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#334155"),
        )

        elements = []

        elements.append(Paragraph("Automated Evaluation Report", title_style))
        grade, status = GradingService.calculate_grade_and_status(evaluation.percentage)
        sub_text = (
            f"<b>Evaluation ID:</b> {evaluation.id} | "
            f"<b>Exam ID:</b> {evaluation.exam_id} | "
            f"<b>Student ID:</b> {evaluation.student_id}"
        )
        elements.append(Paragraph(sub_text, subtitle_style))

        summary_data = [
            ["Total Score", "Percentage", "Grade", "Status"],
            [
                f"{evaluation.total_score} / {evaluation.total_max_marks}",
                f"{evaluation.percentage}%",
                grade.value,
                status.value,
            ],
        ]
        status_color = colors.HexColor("#166534") if status.value == "Pass" else colors.HexColor("#991B1B")
        summary_table = Table(summary_data, colWidths=[130, 130, 130, 130])
        summary_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
                ("FONTNAME", (0, 0), (-1, -1), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 11),
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                ("TEXTCOLOR", (3, 1), (3, 1), status_color),
            ])
        )
        elements.append(summary_table)
        elements.append(Spacer(1, 14))

        elements.append(Paragraph("Question-wise Evaluation Breakdown", heading2))

        q_table_data = [
            ["Q#", "Marks", "Relevance", "Completeness", "Feedback & Missing Concepts"]
        ]

        for q in evaluation.question_evaluations:
            missing_str = (
                f"<br/><font color='#DC2626'><b>Missing:</b> {', '.join(q.missing_concepts)}</font>"
                if q.missing_concepts
                else ""
            )
            feedback_p = Paragraph(f"{q.feedback}{missing_str}", body)
            q_table_data.append([
                q.question_number,
                f"{q.marks_obtained}/{q.max_marks}",
                f"{int(q.relevance_score * 100)}%",
                f"{int(q.completeness_score * 100)}%",
                feedback_p,
            ])

        q_table = Table(q_table_data, colWidths=[40, 65, 75, 80, 260])
        q_table.setStyle(
            TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E2E8F0")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("ALIGN", (0, 0), (3, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
            ])
        )
        elements.append(q_table)

        doc.build(elements)
        buffer.seek(0)
        return buffer.getvalue()
