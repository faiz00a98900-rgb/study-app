const OCR_API_URL = "https://api.ocr.space/parse/image";

export async function performOCR(fileBuffer: Buffer, fileType: string): Promise<{
  text: string;
  confidence: number;
}> {
  const apiKey = process.env.OCR_SPACE_API_KEY;
  if (!apiKey || apiKey === "your-ocr-space-key") {
    // Return mock data for development when no API key is configured
    return {
      text: "Mock OCR Result: This is placeholder text that would be extracted from the uploaded document. In production, this would contain the actual text extracted from your notes using the OCR.space API. Topics might include data structures, algorithms, machine learning concepts, and more.",
      confidence: 0.95,
    };
  }

  const base64 = fileBuffer.toString("base64");
  const dataUrl = `data:${fileType};base64,${base64}`;

  const formData = new FormData();
  formData.append("base64Image", dataUrl);
  formData.append("language", "eng");
  formData.append("isOverlayRequired", "false");
  formData.append("OCREngine", "2"); // Engine 2 is better for handwritten

  const response = await fetch(OCR_API_URL, {
    method: "POST",
    headers: { apikey: apiKey },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`OCR API error: ${response.status}`);
  }

  const data = await response.json();

  if (data.IsErroredOnProcessing) {
    throw new Error(data.ErrorMessage?.join(", ") || "OCR processing failed");
  }

  const parsedResult = data.ParsedResults?.[0];
  const text = parsedResult?.ParsedText || "";
  const confidence = parsedResult?.TextOverlay?.Lines?.length
    ? parsedResult.WordsParsed / parsedResult.TextOverlay.Lines.reduce(
        (sum: number, line: { Words: unknown[] }) => sum + line.Words.length,
        0
      )
    : 0.8;

  return { text: text.trim(), confidence };
}
