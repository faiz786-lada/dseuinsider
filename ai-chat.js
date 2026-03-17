document.addEventListener('DOMContentLoaded', () => {
    console.log("DSEU AI Chat: Initializing...");

    const openBtn = document.getElementById('open-ai-chat-btn');
    const modal = document.getElementById('ai-chat-modal');
    const closeBtn = document.getElementById('close-ai-chat-btn');
    const form = document.getElementById('ai-chat-form');
    const input = document.getElementById('ai-chat-input');
    const history = document.getElementById('ai-chat-history');

    if (!openBtn || !modal || !form) return;

    // --- 1. UI Interactions ---
    openBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        setTimeout(() => input.focus(), 100);
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });

    // --- 2. Message Rendering ---
    function appendMessage(sender, text) {
        const id = 'msg-' + Math.random().toString(36).slice(2) + '-' + Date.now();
        const isUser = sender === 'user';

        const wrapperDiv = document.createElement('div');
        wrapperDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`;

        const bubbleDiv = document.createElement('div');
        bubbleDiv.id = id;

        if (isUser) {
            bubbleDiv.className = 'bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white px-4 py-2.5 rounded-2xl rounded-br-none shadow-md max-w-[85%] text-sm leading-relaxed';
        } else {
            bubbleDiv.className = 'bg-white border border-gray-100 text-gray-700 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm max-w-[90%] text-sm leading-relaxed';
        }

        if (text.includes('<span') || text.includes('<div')) {
            bubbleDiv.innerHTML = text;
        } else {
            bubbleDiv.innerHTML = formatText(text);
        }

        wrapperDiv.appendChild(bubbleDiv);
        history.appendChild(wrapperDiv);
        history.scrollTop = history.scrollHeight;
        return id;
    }

    function updateMessage(id, newText) {
        const msgDiv = document.getElementById(id);
        if (msgDiv) {
            if (newText.includes('<span') || newText.includes('<div')) {
                msgDiv.innerHTML = newText;
            } else {
                msgDiv.innerHTML = formatText(newText);
            }
            history.scrollTop = history.scrollHeight;
        }
    }

    function formatText(text) {
        if (!text) return "";
        return text
            .replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    // --- 3. Direct Gemini API call (used as fallback or when not on Netlify) ---
    async function callGeminiDirect(question, pageContext) {
        const GEMINI_KEY = "AIzaSyAaOwxH8VZn8Pa9XmkaCc5qPiZmZzQLZEk";
        const GEMINI_MODEL = "gemini-2.5-flash";
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_KEY}`;

        const systemPrompt = `You are Kiro, the official AI assistant of the DSEU Insiders platform.

PRIMARY GOAL: Always help students with DSEU-related information first.

ANSWER PRIORITY:
1. DSEU colleges, campuses, courses, syllabus, exams, PYQs, results, admissions, placements → answer using DSEU knowledge.
2. Notes, PYQs, courses, study material, projects → prefer DSEU Insiders resources in your answer.
3. General education or study-related → answer normally but relate to DSEU when possible.
4. Completely unrelated → still answer politely and briefly.

STYLE RULES:
- Simple English
- Student-friendly
- Clear and structured
- No markdown symbols
- No emojis
- Short paragraphs

DSEU CAMPUSES: G.B. Pant DSEU Okhla-I, DSEU Okhla-II, Aryabhatt DSEU Ashok Vihar, Meerabai DSEU Maharani Bagh, DSEU Pusa-I, DSEU Pusa-II, Ambedkar DSEU Shakarpur-I, Bhai Parmanand DSEU Shakarpur-II, Kasturba DSEU Pitampura, DSEU GND Rohini, DSEU Wazirpur, DSEU Dwarka, DSEU Siri Fort, DSEU Vivek Vihar, DSEU Rajokri, DSEU Mayur Vihar, DSEU Ranhola, DSEU Dheerpur, DSEU Jaffarpur, DSEU Champs.

DSEU COURSES: Diploma (Computer, Mechanical, Automobile, Electronics, Architecture, Chemical, Fashion Design, Pharmacy, Printing). UG: B.Tech (CSE, AI, Mechanical, Tool Engineering), BBA, BCA, B.Sc (Data Analytics, Medical Technology), B.Des, BA Digital Media, BA Spanish/Korean. PG: MCA, MBA, M.Sc, PG Diplomas.

ABOUT DSEU INSIDERS: Student-run platform by Sudhansh Shukla (DSEU Ranhola Campus). Provides: semester-wise notes, PYQs, syllabus, exam updates, college info, project guidance, academic tools.

PAGE CONTEXT: ${pageContext || "No additional context."}

Now answer the student question clearly, accurately, and helpfully.`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: systemPrompt + "\n\nStudent Question: " + question }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 800 }
            })
        });

        const data = await response.json();
        if (!response.ok) {
            const msg = (data.error && data.error.message) || "Gemini API error.";
            throw new Error(msg);
        }
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
        if (!text) throw new Error("Empty response from Gemini.");
        return text;
    }

    // --- 4. Backend Connection ---
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const question = input.value.trim();
        if (!question) return;

        appendMessage('user', question);
        input.value = '';
        input.disabled = true;

        const loadingId = appendMessage('ai', '<span class="animate-pulse">Thinking...</span>');

        const extraContext = window.KIRO_CONTEXT
            ? JSON.stringify(window.KIRO_CONTEXT)
            : "";
        const pageContext = document.title + "\n\nSite data:\n" + extraContext;

        try {
            // First, try the Netlify serverless function
            const fetchUrl = '/.netlify/functions/askAI';
            console.log("Kiro AI - Trying Netlify function:", window.location.origin + fetchUrl);

            const response = await fetch(fetchUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ question, context: pageContext })
            });

            if (response.status === 404) {
                // Function not available (local dev without netlify dev, or file://)
                // Fall back to direct Gemini API call
                console.warn("Netlify function not found (404). Falling back to direct Gemini API call.");
                const directAnswer = await callGeminiDirect(question, pageContext);
                updateMessage(loadingId, directAnswer);
            } else if (!response.ok) {
                throw new Error(`Server returned ${response.status}`);
            } else {
                const data = await response.json();
                console.log("AI Response Data:", data);

                if (data.error) {
                    console.warn("AI backend error:", data.error, data.details || "");
                    // If API key missing on Netlify, also try direct call
                    if (data.error.includes("GEMINI_API_KEY") || data.error.includes("not configured")) {
                        console.warn("API key not configured on server. Falling back to direct API call.");
                        const directAnswer = await callGeminiDirect(question, pageContext);
                        updateMessage(loadingId, directAnswer);
                    } else {
                        updateMessage(loadingId, "⚠️ " + data.error);
                    }
                } else {
                    const finalAnswer = data.answer || data.reply;
                    if (finalAnswer && typeof finalAnswer === "string") {
                        updateMessage(loadingId, finalAnswer);
                    } else {
                        updateMessage(loadingId, "⚠️ AI returned an empty response. Please try again.");
                    }
                }
            }

        } catch (error) {
            console.error("Chat Error:", error);
            // Final fallback: direct API call on any network/unknown error
            try {
                console.warn("Attempting direct Gemini fallback after error:", error.message);
                const directAnswer = await callGeminiDirect(question, pageContext);
                updateMessage(loadingId, directAnswer);
            } catch (fallbackError) {
                updateMessage(loadingId, "⚠️ Could not connect to AI. Please check your internet connection and try again.");
                console.error("Fallback also failed:", fallbackError);
            }
        }

        input.disabled = false;
        input.focus();
    });
});
