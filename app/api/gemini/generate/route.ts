import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Initialize the Google Gen AI client with server-side secrets
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json();

    if (!context || !context.namaSiswa) {
      return NextResponse.json(
        { error: "Nama siswa diperlukan untuk konteks pembuatan catatan." },
        { status: 400 }
      );
    }

    const systemInstruction = 
      "Anda adalah seorang konsultan psikologi anak dan kepala sekolah PAUD/TK berpengalaman di Indonesia. " +
      "Tugas Anda adalah menolong guru menyusun narasi 'Catatan Perkembangan Anak' yang mendalam, ramah, objektif, dan suportif. " +
      "Gunakan bahasa Indonesia yang baik, santun, dan menyejukkan bagi orang tua siswa. " +
      "Fokus pada hal-hal positif yang telah dikuasai anak, diikuti dengan saran stimulasi yang dapat dilakukan bersama orang tua di rumah untuk aspek yang masih perlu bimbingan. " +
      "Hindari penggunaan kata sandi teknis yang membingungkan. Berikan keluaran berupa teks narasi bersih siap salin (terdiri dari 2-3 paragraf terstruktur).";

    const fullPrompt = `Buatkan narasi perkembangan anak untuk siswa berikut:
Nama Siswa: ${context.namaSiswa}
Kelas: ${context.namaKelas || "PAUD"}
Tingkat Perkembangan Intrakurikuler:
${JSON.stringify(context.intrakurikuler, null, 2)}

Tingkat Perkembangan Kokurikuler (Projek):
${JSON.stringify(context.kokurikuler, null, 2)}

Petunjuk Tambahan dari Guru: "${prompt || "Anak aktif, ceria, dan bersosialisasi dengan baik."}"

Tolong formulasikan narasi raport komprehensif yang rapi dan menginspirasi orang tua.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: fullPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const text = response.text || "Gagal membuat narasi. Silakan coba kembali.";
    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan internal server dalam memproses AI." },
      { status: 500 }
    );
  }
}
