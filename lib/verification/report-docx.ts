import { AlignmentType, Document, HeadingLevel, Packer, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from "docx";

type Finding = { code: string; section: string; normative_reference: string | null; assessment: string; severity: string; correction: string | null };
type Calculation = { title: string; conclusion: string | null; review_status: string };
type SourceFile = { file_name: string; document_role: string };

const cell = (text: string, bold = false) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text, bold, size: 18 })] })] });
const heading = (text: string) => new Paragraph({ text, heading: HeadingLevel.HEADING_1, spacing: { before: 300, after: 140 } });

export async function buildVerificationDraft(values: { title: string; project: string; code: string | null; discipline: string; status: string; findings: Finding[]; calculations: Calculation[]; files: SourceFile[] }) {
  const findingRows = values.findings.length ? values.findings.map((item) => new TableRow({ children: [cell(item.code), cell(item.section), cell(item.normative_reference ?? "Требует уточнения"), cell(`${item.assessment}; ${item.severity}`), cell(item.correction ?? "—")] })) : [new TableRow({ children: [cell("—"), cell("Замечания не внесены"), cell("—"), cell("—"), cell("—")] })];
  const doc = new Document({ sections: [{ properties: { page: { margin: { top: 900, bottom: 900, left: 900, right: 900 } } }, children: [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: "ВНУТРЕННИЙ ЧЕРНОВИК — ТРЕБУЕТ ПРОВЕРКИ УПОЛНОМОЧЕННЫМ ИНЖЕНЕРОМ", bold: true, color: "B91C1C", size: 20 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 280 }, children: [new TextRun({ text: "ОТЧЁТ ВЕРИФИКАЦИИ ПРОЕКТНЫХ РЕШЕНИЙ", bold: true, size: 28 })] }),
    heading("1. Сведения о проверке"),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [new TableRow({ children: [cell("Досье", true), cell(values.title)] }), new TableRow({ children: [cell("Проект", true), cell(values.project)] }), new TableRow({ children: [cell("Код проекта", true), cell(values.code ?? "—")] }), new TableRow({ children: [cell("Дисциплина", true), cell(values.discipline)] }), new TableRow({ children: [cell("Статус", true), cell(values.status)] })] }),
    heading("2. Документы, принятые для проверки"),
    ...values.files.map((file, index) => new Paragraph({ text: `${index + 1}. ${file.file_name} — ${file.document_role}` })),
    ...(values.files.length ? [] : [new Paragraph("Документы не зарегистрированы в досье.")]),
    heading("3. Матрица проверок и замечаний"),
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [new TableRow({ children: [cell("№", true), cell("Раздел", true), cell("Нормативный пункт", true), cell("Оценка", true), cell("Корректировка", true)] }), ...findingRows] }),
    heading("4. Расчёты"),
    ...values.calculations.map((item) => new Paragraph({ text: `${item.title}: ${item.conclusion ?? "Требуется ручная проверка"}. Статус: ${item.review_status}.` })),
    ...(values.calculations.length ? [] : [new Paragraph("Расчёты не сохранены.")]),
    heading("5. Заключение"),
    new Paragraph("Настоящий документ является внутренним рабочим черновиком. Он не является официальным экспертным заключением, не заменяет проверку применимости нормативов и не должен выпускаться без проверки и утверждения уполномоченным инженером."),
  ] }] });
  return Packer.toBuffer(doc);
}
