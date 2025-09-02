import {
  AlignmentType,
  Document,
  Footer,
  Header,
  HeadingLevel,
  LevelFormat,
  Packer,
  Paragraph,
  TextRun,
  UnderlineType,
  PageNumber,
  ISectionOptions,
  INumberingOptions,
  TabStopType,
} from "docx";
import { saveAs } from "file-saver";
import type { UITest, Question } from "@/types/test";

type ExportOptions = {
  includeAnswerKey?: boolean;
  course?: string;
  dateLabel?: string;
  durationLabel?: string;
  studentLine?: boolean;
};

const DEFAULTS: Required<ExportOptions> = {
  includeAnswerKey: false,
  course: "",
  dateLabel: "",
  durationLabel: "",
  studentLine: true,
};

function sanitizeFilename(name: string): string {
  return (name || "Test").replace(/[<>:"/\\|?*\u0000-\u001F]/g, "_").slice(0, 120);
}
function letter(idx: number): string {
  return String.fromCharCode("A".charCodeAt(0) + idx);
}

function numberingOptions(): INumberingOptions {
  return {
    config: [
      {
        reference: "questions-num",
        levels: [
          {
            level: 0,
            format: LevelFormat.DECIMAL,
            text: "%1.",
            alignment: AlignmentType.START,
            style: {
              paragraph: {
                indent: { left: 720, hanging: 360 }, // 0.5" left, 0.25" hanging
                spacing: { after: 120 },
              },
            },
          },
        ],
      },
    ],
  };
}

function renderMetaParas(opts: Required<ExportOptions>): Paragraph[] {
  const paras: Paragraph[] = [];

  if (opts.course || opts.dateLabel) {
    paras.push(
      new Paragraph({
        children: [
          new TextRun({ text: opts.course, bold: true }),
          new TextRun({ text: "\t" }),
          new TextRun({ text: opts.dateLabel }),
        ],
        tabStops: [{ type: TabStopType.RIGHT, position: 9020 }],
        spacing: { after: 60 },
      })
    );
  }

  const rightSide = opts.studentLine
    ? [new TextRun({ text: "Ime i prezime: " }), new TextRun({ text: "______________________________", underline: { type: UnderlineType.SINGLE } })]
    : [new TextRun({ text: "" })];

  paras.push(
    new Paragraph({
      children: [
        new TextRun({ text: opts.durationLabel, italics: true, color: "666666" }),
        new TextRun({ text: "\t" }),
        ...rightSide,
      ],
      tabStops: [{ type: TabStopType.RIGHT, position: 9020 }],
      spacing: { after: 200 },
    })
  );

  return paras;
}

function renderQuestion(q: Question): Paragraph[] {
  const out: Paragraph[] = [];

  out.push(
    new Paragraph({
      numbering: { reference: "questions-num", level: 0 },
      children: [
        new TextRun({ text: q.text, bold: true }),
        new TextRun({ text: " " }),
        new TextRun({ text: `(${q.points} bod.)`, color: "666666" }),
        ...(q.topic ? [new TextRun({ text: `  [${q.topic}]`, color: "888888", italics: true })] : []),
      ],
      spacing: { after: 120 },
    })
  );

  if (q.type === "mcq" && q.options && q.options.length) {
    q.options.forEach((opt) => {
      out.push(
        new Paragraph({
          children: [
            new TextRun({ text: "☐ " }),
            new TextRun({ text: opt }),
          ],
          indent: { left: 1440, hanging: 360 },
          spacing: { after: 60 },
        })
      );
    });
    out.push(new Paragraph({ children: [new TextRun({ text: "" })], spacing: { after: 160 } }));
    return out;
  }

  if (q.type === "truefalse") {
    ["True", "False"].forEach((opt, i) => {
      out.push(
        new Paragraph({
          children: [
            new TextRun({ text: `${letter(i)}) `, bold: true }),
            new TextRun({ text: opt }),
          ],
          indent: { left: 1440, hanging: 360 },
          spacing: { after: 60 },
        })
      );
    });
    out.push(new Paragraph({ children: [new TextRun({ text: "" })], spacing: { after: 160 } }));
    return out;
  }

  out.push(
    new Paragraph({
      children: [new TextRun({ text: "Odgovor: _____________________________________________" })],
      spacing: { after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: "_______________________________________________" })],
      spacing: { after: 180 },
    })
  );

  return out;
}


function renderAnswerKey(questions: Question[]): Paragraph[] {
  const out: Paragraph[] = [];

  out.push(
    new Paragraph({
      children: [new TextRun({ text: "Rješenja", bold: true })],
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 240, after: 160 },
    })
  );

  questions.forEach((q, i) => {
    let ans = q.correctAnswer;
    if (q.type === "mcq" && q.options) {
      const idx = q.options.findIndex(
        (o) => o.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
      );
      if (idx >= 0) ans = `${letter(idx)}) ${q.correctAnswer}`;
    }
    out.push(
      new Paragraph({
        children: [new TextRun({ text: `${i + 1}. `, bold: true }), new TextRun({ text: ans })],
        spacing: { after: 80 },
      })
    );
  });

  return out;
}

export async function downloadTestAsDocx(
  test: UITest,
  options?: ExportOptions
): Promise<void> {
  const opts: Required<ExportOptions> = { ...DEFAULTS, ...(options || {}) };

  const title = test.name || "Test";
  const desc = test.description || "";

  const blocks: Paragraph[] = [];

  blocks.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: title, bold: true, size: 34 })],
      spacing: { after: 200 },
    })
  );

  blocks.push(...renderMetaParas(opts));

  if (desc.trim()) {
    blocks.push(
      new Paragraph({
        children: [new TextRun({ text: "" })],
        spacing: { before: 400 },
      })
    );

    blocks.push(
      new Paragraph({
        children: [new TextRun({ text: desc, color: "444444" })],
        spacing: { before: 40, after: 600 },
      })
    );

    blocks.push(
      new Paragraph({
        children: [new TextRun({ text: "" })],
        spacing: { after: 400 },
      })
    );
  }

  const qs = test.questions ?? [];
  if (qs.length) {
    qs.forEach((q) => renderQuestion(q).forEach((p) => blocks.push(p)));
  } else {
    blocks.push(
      new Paragraph({
        children: [new TextRun({ text: "Nema pitanja." })],
        spacing: { before: 500 },
      })
    );
  }

  if (opts.includeAnswerKey && qs.length) {
    blocks.push(new Paragraph({ children: [new TextRun({ text: "" })], pageBreakBefore: true }));
    renderAnswerKey(qs).forEach((p) => blocks.push(p));
  }

  const section: ISectionOptions = {
    properties: {
      page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } }, 
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: " " })],
          }),
        ],
      }),
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Stranica " }),
              new TextRun({ children: [PageNumber.CURRENT] }),
              new TextRun({ text: " od " }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES] }),
            ],
          }),
        ],
      }),
    },
    children: blocks,
  };

  const doc = new Document({
    creator: "Kontrolne Zadaće",
    description: "Generirani test",
    title,
    numbering: numberingOptions(),
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 24 }, // 12pt
          paragraph: { spacing: { line: 276 } },
        },
      },
      paragraphStyles: [
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { bold: true, size: 28 },
          paragraph: { spacing: { before: 200, after: 120 } },
        },
      ],
    },
    sections: [section],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${sanitizeFilename(title)}.docx`);
}
