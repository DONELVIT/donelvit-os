import fs from "node:fs/promises";
import path from "node:path";
import Docxtemplater from "docxtemplater";
import PizZip from "pizzip";

export type ContractTemplateValues = Record<string, string>;

export async function renderContractDocx(values: ContractTemplateValues) {
  const template = await fs.readFile(path.join(process.cwd(), "assets", "docx-templates", "Contract.docx"));
  const zip = new PizZip(template);
  const document = new Docxtemplater(zip, {
    delimiters: { start: "{{", end: "}}" },
    paragraphLoop: true,
    linebreaks: true,
  });
  document.render(values);
  return document.getZip().generate({ type: "nodebuffer", compression: "DEFLATE" });
}
