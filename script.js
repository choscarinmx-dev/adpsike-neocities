'use strict';

// UTILIDADES DOM
const DOM = {
    get: (id) => document.getElementById(id),
    getAll: (selector) => document.querySelectorAll(selector),
    addClass: (el, cls) => el?.classList.add(cls),
    removeClass: (el, cls) => el?.classList.remove(cls),
    toggleClass: (el, cls) => el?.classList.toggle(cls),
    hasClass: (el, cls) => el?.classList.contains(cls),
    setAttr: (el, attr, val) => el?.setAttribute(attr, val),
    getAttr: (el, attr) => el?.getAttribute(attr),
    setStyle: (el, styles) => Object.assign(el?.style || {}, styles),
    hideAll: (selector) => {
        document.querySelectorAll(selector).forEach(el => el.classList.remove('active'));
    }
};

// NAVEGACIÓN
const Navigation = {
    init() {
        this.mobileMenu();
        this.scrollEffect();
        this.smoothScroll();
    },
    mobileMenu() {
        const toggle = DOM.get("menuToggle");
        const nav = DOM.get("navLinks");
        if (!toggle || !nav) return;
        toggle.addEventListener("click", () => {
            DOM.toggleClass(nav, "active");
            DOM.setAttr(toggle, "aria-expanded", DOM.hasClass(nav, "active"));
        });
        nav.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => {
                DOM.removeClass(nav, "active");
                DOM.setAttr(toggle, "aria-expanded", "false");
            });
        });
        document.addEventListener("click", (e) => {
            if (!nav.contains(e.target) && !toggle.contains(e.target)) {
                DOM.removeClass(nav, "active");
                DOM.setAttr(toggle, "aria-expanded", "false");
            }
        });
    },
    scrollEffect() {
        const header = DOM.get("header");
        if (!header) return;
        let ticking = false;
        window.addEventListener("scroll", () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    window.scrollY > 50 
                        ? DOM.addClass(header, "scrolled")
                        : DOM.removeClass(header, "scrolled");
                    ticking = false;
                });
                ticking = true;
            }
        });
    },
    smoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener("click", (e) => {
                const targetId = anchor.getAttribute("href");
                if (targetId === "#") return;
                const target = document.querySelector(targetId);
                if (target) {
                    e.preventDefault();
                    const offset = target.getBoundingClientRect().top + window.pageYOffset - 80;
                    window.scrollTo({ top: offset, behavior: "smooth" });
                }
            });
        });
    }
};

// ANIMACIONES
const Animations = {
    init() {
        this.setupObserver();
    },
    animateCounter(el) {
        const targetAttr = el.getAttribute("data-count");
        if(!targetAttr) return;
        const target = parseInt(targetAttr);
        const label = el.parentElement.querySelector(".stat-label");
        const suffix = label?.textContent.includes("Satisfacción") ? "%" : "";
        const duration = 2000, stepTime = 20;
        const increment = target / (duration / stepTime);
        let current = 0;
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                el.textContent = target + suffix;
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(current) + suffix;
            }
        }, stepTime);
    },
    setupObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    if (entry.target.classList.contains("stat-number")) {
                        setTimeout(() => this.animateCounter(entry.target), 100);
                        observer.unobserve(entry.target);
                    }
                    DOM.setStyle(entry.target, { opacity: "1", transform: "translateY(0)" });
                }
            });
        }, { threshold: 0.1 });
        DOM.getAll(".stat-number").forEach(el => observer.observe(el));
        DOM.getAll(".service-card, .testimonial-card, .blog-card, .contact-item, .pricing-card, .process-step, .quiz-container, .roi-container, .tool-card, .jar-container, .emotions-section, .sos-trigger-section").forEach((el) => {
            DOM.setStyle(el, { opacity: "0", transform: "translateY(30px)", transition: "opacity 0.6s ease, transform 0.6s ease" });
            observer.observe(el);
        });
    }
};

// ACCORDION (FAQ)
const Accordion = {
    init() {
        DOM.getAll(".faq-question").forEach(q => q.addEventListener("click", () => this.toggle(q)));
    },
    toggle(question) {
        const isOpen = DOM.getAttr(question, "aria-expanded") === "true";
        const answer = question.nextElementSibling;
        const parent = question.closest(".faq-category");
        if (parent) {
            parent.querySelectorAll('.faq-question[aria-expanded="true"]').forEach((q) => {
                if (q !== question) {
                    DOM.removeClass(q, "active");
                    DOM.setAttr(q, "aria-expanded", "false");
                    if(q.nextElementSibling) {
                        DOM.removeClass(q.nextElementSibling, "open");
                        DOM.setStyle(q.nextElementSibling, { maxHeight: "0" });
                    }
                }
            });
        }
        DOM.toggleClass(question, "active");
        DOM.setAttr(question, "aria-expanded", !isOpen);
        if(answer) {
            DOM.toggleClass(answer, "open");
            DOM.setStyle(answer, { maxHeight: DOM.hasClass(answer, "open") ? answer.scrollHeight + "px" : "0" });
        }
    }
};

// CALCULADORA ROI
const ROI = {
    init() {
        const btn = DOM.get("calculate-btn");
        if (btn) btn.addEventListener("click", () => this.calculate());
    },
    calculate() {
        const getVal = (id) => Math.max(0, parseFloat(DOM.get(id)?.value) || 0);
        const lostHours = getVal("lost-hours");
        const productivity = getVal("productivity-cost");
        const relationship = Math.max(1, parseFloat(DOM.get("relationship-impact")?.value) || 1);
        const health = Math.max(1, parseFloat(DOM.get("health-impact")?.value) || 1);
        const therapy = getVal("therapy-cost");
        if (!lostHours && !productivity && !therapy) {
            alert("Por favor ingresa algunos datos para calcular.");
            return;
        }
        const cost = productivity + (200 * lostHours * 4) + (150 * relationship) + (150 * health);
        const benefit = 0.7 * cost;
        const roi = therapy > 0 ? ((benefit - therapy) / therapy) * 100 : 0;
        const elCost = DOM.get("total-cost");
        const elBen = DOM.get("benefit");
        const elRoi = DOM.get("roi");
        if(elCost) elCost.textContent = `$${cost.toLocaleString('es-MX')} MXN`;
        if(elBen) elBen.textContent = `$${benefit.toLocaleString('es-MX')} MXN`;
        if(elRoi) elRoi.textContent = `${roi.toFixed(0)}%`;
        const result = DOM.get("result");
        if(result) DOM.addClass(result, "show");
    }
};

// QUIZ PHQ-9
const Quiz = {
    questions: [{ id: "q1" }, { id: "q2" }, { id: "q3" }, { id: "q4" }, { id: "q5" }],
    current: 0,
    init() {
        const btn = DOM.get("startQuizButton");
        if (!btn) return;
        const saved = localStorage.getItem('adpsike_quiz_idx');
        if (saved && +saved > 0 && +saved < 5) btn.textContent = "Continuar Test";
        btn.addEventListener("click", () => {
            DOM.setStyle(btn, { display: "none" });
            if (saved && +saved > 0) {
                DOM.setStyle(DOM.get("quizStart"), { display: "none" });
                DOM.setStyle(DOM.get("quizQuestions"), { display: "block" });
                this.show(+saved);
            } else {
                DOM.setStyle(DOM.get("quizStart"), { display: "block" });
            }
        });
        DOM.get("confirmStart")?.addEventListener("click", () => {
            DOM.setStyle(DOM.get("quizStart"), { display: "none" });
            DOM.setStyle(DOM.get("quizQuestions"), { display: "block" });
            this.show(0);
        });
    },
    show(index) {
        if (index >= this.questions.length) return this.result();
        this.current = index;
        localStorage.setItem('adpsike_quiz_idx', index);
        DOM.getAll(".quiz-question").forEach(q => DOM.removeClass(q, "active"));
        const current = DOM.get(this.questions[index].id);
        if (current) {
            DOM.addClass(current, "active");
            this.setupRadios(this.questions[index].id);
        }
        const currText = DOM.get("currentQuestion");
        const progFill = DOM.get("progressFill");
        if(currText) currText.textContent = index + 1;
        if(progFill) progFill.style.width = ((index + 1) / 5) * 100 + "%";
        const btn = DOM.get(`next${index + 1}`);
        if (btn) {
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);
            DOM.setStyle(newBtn, { display: "none" });
            const alreadyChecked = document.querySelector(`#${this.questions[index].id} input[type="radio"]:checked`);
            if (alreadyChecked) DOM.setStyle(newBtn, { display: "block" });
            DOM.getAll(`#${this.questions[index].id} input[type="radio"]`).forEach(input => {
                input.addEventListener("change", () => DOM.setStyle(newBtn, { display: "block" }));
            });
            newBtn.addEventListener("click", () => this.show(this.current + 1));
        }
    },
    setupRadios(id) {
        DOM.getAll(`#${id} .quiz-option`).forEach(opt => {
            opt.querySelector('input[type="radio"]')?.addEventListener('change', () => {
                DOM.getAll(`#${id} .quiz-option`).forEach(o => DOM.removeClass(o, 'selected'));
                DOM.addClass(opt, 'selected');
            });
        });
    },
    result() {
        let score = 0;
        this.questions.forEach(q => {
            const checked = document.querySelector(`#${q.id} input[type="radio"]:checked`);
            if (checked) score += +checked.value;
        });
        localStorage.removeItem('adpsike_quiz_idx');
        const results = score <= 4 
            ? { title: "Estás en un buen momento 🌿", msg: "Parece que estás gestionando bien tus emociones." }
            : score <= 9
            ? { title: "Hay días grises ☁️", msg: "Es posible que sientas estrés acumulado." }
            : score <= 14
            ? { title: "Te noto abrumado(a) ❤️‍🩹", msg: "Cargas con muchas cosas. No tienes que poder con todo." }
            : { title: "Tu bienestar es prioridad 🌟", msg: "Tus respuestas indican un momento difícil. Mereces apoyo." };
        DOM.setStyle(DOM.get("quizQuestions"), { display: "none" });
        DOM.setStyle(DOM.get("quizResult"), { display: "block" });
        const rTitle = DOM.get("resultTitle");
        const rText = DOM.get("resultText");
        if(rTitle) rTitle.textContent = results.title;
        if(rText) rText.textContent = results.msg;
        const link = DOM.get("quizResult")?.querySelector('a.btn-primary');
        const msg = `Hola Adpsike, realicé el test de bienestar. Obtuve ${score} puntos (${results.title}).`;
        if (link) DOM.setAttr(link, 'href', `https://wa.me/5214491996086?text=${encodeURIComponent(msg)}`);
    }
};

// HERRAMIENTAS (RECURSOS)
const Tools = {
    quiz2Score: { 1: null, 2: null },
    init() {
        this.setupToggles();
        this.setupBreathing();
        this.setupAnxietyQuiz();
        this.setupLoadCheckbox();
    },
    setupToggles() {
        [['btn-text-quiz', 'content-quiz'], ['btn-text-load', 'content-load']].forEach(([btnId, contentId]) => {
            const btn = DOM.get(btnId), content = DOM.get(contentId);
            if (btn && content) {
                btn.addEventListener('click', () => {
                    DOM.toggleClass(content, 'active');
                    const isActive = DOM.hasClass(content, 'active');
                    btn.textContent = isActive 
                        ? 'Cerrar Herramienta' 
                        : (btnId.includes('quiz') ? 'Iniciar Mini Test' : 'Medir mi Carga');
                });
            }
        });
    },
    setupBreathing() {
        const txt = DOM.get('breatheText');
        if (!txt) return;
        const cycle = () => {
            txt.innerText = "INHALA";
            setTimeout(() => { if(txt) txt.innerText = "RETÉN"; }, 4000);
            setTimeout(() => { if(txt) txt.innerText = "EXHALA"; }, 6000);
        };
        cycle();
        setInterval(cycle, 10000);
    },
    setupAnxietyQuiz() {
        DOM.getAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const parent = btn.parentElement;
                const id = +DOM.getAttr(parent, 'data-question');
                const val = +DOM.getAttr(btn, 'data-val');
                if (id > 0 && !isNaN(val)) {
                    parent.querySelectorAll('.option-btn').forEach(b => DOM.removeClass(b, 'selected'));
                    DOM.addClass(btn, 'selected');
                    this.quiz2Score[id] = val;
                    if (this.quiz2Score[1] !== null && this.quiz2Score[2] !== null) {
                        const total = this.quiz2Score[1] + this.quiz2Score[2];
                        const result = DOM.get('quiz-result');
                        const text = DOM.get('result-text');
                        if (result) DOM.setStyle(result, { display: 'block' });
                        if (text) text.textContent = total <= 2 
                            ? "Síntomas leves. ¡Sigue cuidándote!" 
                            : total <= 4 
                            ? "Ansiedad moderada. Prueba la respiración abajo." 
                            : "Síntomas elevados. Considera agendar una cita.";
                    }
                }
            });
        });
    },
    setupLoadCheckbox() {
        const items = DOM.getAll('.check-item');
        const bar = DOM.get('load-bar');
        const text = DOM.get('load-text');
        if (!items.length || !bar || !text) return;
        items.forEach(item => {
            item.addEventListener('click', () => {
                DOM.toggleClass(item, 'active');
                const active = DOM.getAll('.check-item.active').length;
                const percent = (active / items.length) * 100;
                DOM.setStyle(bar, { width: `${percent}%` });
                const levels = [
                    { max: 0, text: "Baja", color: "#10B981" },
                    { max: 2, text: "Manejable", color: "#10B981" },
                    { max: 4, text: "Elevada", color: "#F59E0B" },
                    { max: Infinity, text: "Crítica", color: "#EF4444" }
                ];
                const level = levels.find(l => active <= l.max);
                if (level) {
                    text.textContent = level.text;
                    DOM.setStyle(bar, { background: level.color });
                }
            });
        });
    }
};

// TARRO DE LA CALMA
const Jar = {
    frases: [
        "No tienes que poder con todo hoy. Solo con lo de hoy.",
        "Tu ansiedad te miente: no estás en peligro, estás incómodo.",
        "Hacer una pausa también es avanzar.",
        "Eres suficiente, incluso en los días que no eres productivo.",
        "Respira. Esto es un momento, no toda tu vida.",
        "Sé amable contigo mismo. Estás haciendo lo mejor que puedes.",
        "Los sentimientos son visitantes, déjalos venir y déjalos ir.",
        "No creas todo lo que piensas, especialmente de noche.",
        "Está bien pedir ayuda. Es un acto de valentía, no de debilidad."
    ],
    init() {
        const btn = DOM.get('btn-open-jar');
        const display = DOM.get('jar-display');
        if (!btn || !display) return;
        btn.addEventListener('click', () => {
            DOM.setStyle(display, { transform: 'scale(0.98)', opacity: '0.8' });
            setTimeout(() => {
                const frase = this.frases[Math.floor(Math.random() * this.frases.length)];
                display.innerHTML = `<p class="jar-message-text">"${frase}"</p>`;
                DOM.setStyle(display, { transform: 'scale(1)', opacity: '1' });
                btn.textContent = "✨ Abrir otra dosis ✨";
            }, 200);
        });
    }
};

// RUEDA DE EMOCIONES
const Emotions = {
    data: [
        { nombre: 'Enojo', emoji: '😡', size: 'bubble-lg', color: 'linear-gradient(135deg, #EF4444, #B91C1C)', desc: 'Una respuesta natural ante la injusticia o límites cruzados.', tip: 'No reacciones de inmediato. Respira 10 veces. Pregúntate: ¿Qué límite se vulneró?' },
        { nombre: 'Tristeza', emoji: '😢', size: 'bubble-md', color: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', desc: 'Tu mente procesando una pérdida o un cambio necesario.', tip: 'Permítete llorar. La tristeza necesita ser sentida para evaporarse.' },
        { nombre: 'Ansiedad', emoji: '😰', size: 'bubble-lg', color: 'linear-gradient(135deg, #A855F7, #7E22CE)', desc: 'Tu sistema intentando protegerte de un futuro incierto.', tip: 'Nombra 3 cosas que ves, 2 que tocas y 1 que hueles para volver al presente.' },
        { nombre: 'Calma', emoji: '😌', size: 'bubble-sm', color: 'linear-gradient(135deg, #10B981, #047857)', desc: 'El estado de equilibrio donde tu sistema nervioso descansa.', tip: 'Disfruta este momento. Intenta guardarlo como un "lugar seguro".' },
        { nombre: 'Agotado', emoji: '😫', size: 'bubble-md', color: 'linear-gradient(135deg, #F59E0B, #B45309)', desc: 'Señal física y mental de que has dado demasiado.', tip: 'Hoy haz lo mínimo indispensable y permítete dormir temprano.' },
        { nombre: 'Confusión', emoji: '🌀', size: 'bubble-sm', color: 'linear-gradient(135deg, #64748B, #334155)', desc: 'Cuando hay muchas opciones o emociones mezcladas.', tip: 'Escribe todo lo que sientes sin filtro para ordenar tu mente.' }
    ],
    init() {
        const container = DOM.get('bubbles-container');
        const overlay = DOM.get('emotion-card-overlay');
        if (!container || !overlay) return;
        this.data.forEach((emocion) => {
            const bubble = document.createElement('div');
            DOM.addClass(bubble, `emotion-bubble`);
            DOM.addClass(bubble, emocion.size);
            bubble.innerText = emocion.nombre;
            DOM.setStyle(bubble, { background: emocion.color, animationDelay: `${Math.random() * 2}s` });
            DOM.setAttr(bubble, 'tabindex', '0');
            DOM.setAttr(bubble, 'role', 'button');
            const openCard = () => this.open(emocion, overlay);
            bubble.addEventListener('click', openCard);
            bubble.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCard(); }
            });
            container.appendChild(bubble);
        });
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) Modals.close(overlay);
        });
    },
    open(emocion, overlay) {
        const icon = DOM.get('emotion-icon');
        const title = DOM.get('emotion-title');
        const desc = DOM.get('emotion-desc');
        const tip = DOM.get('emotion-tip');
        const header = DOM.get('emotion-header-bg');
        if(icon) icon.innerText = emocion.emoji;
        if(title) title.innerText = emocion.nombre;
        if(desc) desc.innerText = emocion.desc;
        if(tip) tip.innerText = emocion.tip;
        if(header) DOM.setStyle(header, { background: emocion.color });
        DOM.setStyle(overlay, { display: 'flex' });
        setTimeout(() => DOM.addClass(overlay, 'active'), 10);
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            const closeBtn = overlay.querySelector('.close-modal-btn');
            if(closeBtn) closeBtn.focus();
        }, 50);
    }
};

// MODALES
const Modals = {
    init() {
        DOM.getAll('.read-more').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = DOM.getAttr(btn, 'data-modal-target');
                const modal = DOM.get(targetId);
                if (modal) {
                    DOM.setStyle(modal, { display: 'flex' });
                    setTimeout(() => DOM.addClass(modal, 'active'), 10);
                    document.body.style.overflow = 'hidden';
                }
            });
        });
        DOM.getAll('.close-modal-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal-overlay, .emotion-overlay');
                this.close(modal);
            });
        });
        DOM.getAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.close(modal);
            });
        });
    },
    close(modal) {
        if (!modal) return;
        DOM.removeClass(modal, 'active');
        setTimeout(() => DOM.setStyle(modal, { display: 'none' }), 300);
        document.body.style.overflow = 'auto';
    }
};

// SOS CRISIS TOOL
const SOS = {
    state: { bs: { timer: null, step: 0, paused: false, active: false }, crisis: { timer: null, breathing: false, cycles: 0 }, grounding: 0 },
    bsSteps: [
        { id: 'svg-head', label: 'Cabeza y Cara' },
        { id: 'svg-shoulders', label: 'Hombros y Cuello' },
        { id: 'svg-arms', label: 'Brazos y Manos' },
        { id: 'svg-torso', label: 'Pecho y Estómago' },
        { id: 'svg-legs', label: 'Piernas y Pies' }
    ],
    groundingSteps: [
        { icon: '👁️', title: 'Vista', text: 'Encuentra 5 cosas de color azul', color: '#3B82F6' },
        { icon: '✋', title: 'Tacto', text: 'Toca 4 cosas con texturas diferentes', color: '#F59E0B' },
        { icon: '👂', title: 'Oído', text: 'Identifica 3 sonidos lejanos', color: '#10B981' },
        { icon: '👃', title: 'Olfato', text: 'Identifica 2 olores', color: '#EC4899' },
        { icon: '❤️', title: 'Emoción', text: 'Di 1 cosa buena sobre ti', color: '#8B5CF6' }
    ],
    init() {
        const trigger = DOM.get('btn-sos-trigger');
        const overlay = DOM.get('sos-overlay');
        const closeBtn = DOM.get('close-sos-btn');
        if (!trigger || !overlay) return;
        trigger.addEventListener('click', () => {
            DOM.setStyle(overlay, { display: 'block' });
            setTimeout(() => DOM.addClass(overlay, 'active'), 10);
            document.body.style.overflow = 'hidden';
            this.reset();
        });
        if(closeBtn) closeBtn.addEventListener('click', () => this.close(overlay));
        window.closeSos = () => this.close(overlay);
        window.handleSosChoice = (choice) => this.handleChoice(choice);
        window.resetSos = () => this.reset();
        window.stopBodyScan = () => this.stopBS();
        window.startGrounding = () => this.startGrounding();
        window.nextGroundingStep = () => this.nextGroundingStep();
        window.startActualBodyScan = () => this.startBS();
        window.togglePause = () => this.togglePause();
        window.skipBodyScan = () => this.finishBS();
        window.startCrisisBreathing = () => this.startCrisis();
        window.showSuicideReasons = () => this.show('sos-screen-suicide-reasons');
        window.enableReasonsNext = () => this.enableReasonsNext();
        window.showSuicideContract = () => this.show('sos-screen-suicide-contract');
        window.finishSuicideModule = () => this.show('sos-screen-suicide-final');
        const bsDirect = DOM.get('btn-open-bodyscan-direct');
        if(bsDirect) {
            bsDirect.addEventListener('click', () => {
                DOM.setStyle(overlay, { display: 'block' });
                setTimeout(() => DOM.addClass(overlay, 'active'), 10);
                document.body.style.overflow = 'hidden';
                this.stopBS();
                DOM.hideAll('.sos-screen');
                const intro = DOM.get('sos-screen-bs-intro');
                if(intro) DOM.addClass(intro, 'active');
            });
        }
    },
    show(id) {
        DOM.hideAll('.sos-screen');
        const el = DOM.get(id);
        if(el) DOM.addClass(el, 'active');
    },
    handleChoice(choice) {
        const map = {
            'suicide': 'sos-screen-suicide-validation',
            'triage-2': 'sos-screen-triage-2',
            'risk': 'sos-screen-risk',
            'disconnect': 'sos-screen-bs-intro',
            'panic': 'sos-screen-calm-intro'
        };
        if (map[choice]) this.show(map[choice]);
    },
    reset() {
        this.stopBS();
        clearTimeout(this.state.crisis.timer);
        this.state.crisis.breathing = false;
        DOM.getAll('.breath-dot').forEach(d => DOM.removeClass(d, 'active'));
        this.show('sos-screen-1');
        this.state.grounding = 0;
    },
    close(overlay) {
        DOM.removeClass(overlay, 'active');
        setTimeout(() => DOM.setStyle(overlay, { display: 'none' }), 300);
        document.body.style.overflow = 'auto';
        this.stopBS();
        clearTimeout(this.state.crisis.timer);
        this.state.crisis.breathing = false;
    },
    stopBS() {
        this.state.bs.active = false;
        this.state.bs.paused = false;
        clearTimeout(this.state.bs.timer);
        DOM.getAll('.body-path').forEach(p => {
            DOM.removeClass(p, 'fill-active');
            DOM.removeClass(p, 'fill-relax');
        });
    },
    startGrounding() {
        this.show('sos-screen-grounding');
        this.state.grounding = 0;
        this.updateGroundingUI();
    },
    nextGroundingStep() {
        this.state.grounding++;
        if (this.state.grounding < this.groundingSteps.length) {
            this.updateGroundingUI();
        } else {
            this.show('sos-screen-final');
        }
    },
    updateGroundingUI() {
        const step = this.groundingSteps[this.state.grounding];
        const icon = DOM.get('grounding-icon');
        const title = DOM.get('grounding-title');
        const text = DOM.get('grounding-text');
        DOM.setStyle(icon, { transform: 'scale(0.8)', opacity: '0' });
        setTimeout(() => {
            icon.innerText = step.icon;
            title.innerText = step.title;
            text.innerText = step.text;
            DOM.setStyle(title, { color: step.color });
            DOM.getAll('.grounding-dot').forEach((d, i) => {
                i <= this.state.grounding ? DOM.addClass(d, 'active') : DOM.removeClass(d, 'active');
            });
            DOM.setStyle(icon, { transform: 'scale(1)', opacity: '1' });
        }, 200);
    },
    startBS() {
        this.show('sos-screen-bs-active');
        this.state.bs.step = 0;
        this.state.bs.paused = false;
        this.state.bs.active = true;
        const btn = DOM.get('btn-bs-pause');
        if (btn) { btn.innerHTML = "⏸ Pausar"; DOM.removeClass(btn, 'paused'); }
        DOM.getAll('.body-path, .bs-dot').forEach(e => {
            DOM.removeClass(e, 'fill-active');
            DOM.removeClass(e, 'fill-relax');
            DOM.removeClass(e, 'active');
            DOM.removeClass(e, 'completed');
        });
        this.runBS();
    },
    runBS() {
        if (!this.state.bs.active || this.state.bs.paused) return;
        if (this.state.bs.step >= this.bsSteps.length) return this.finishBS();
        const data = this.bsSteps[this.state.bs.step];
        const instr = DOM.get('bs-text-instruction');
        const svg = DOM.get(data.id);
        const dots = DOM.getAll('.bs-dot');
        dots.forEach((d, i) => {
            if (i < this.state.bs.step) DOM.addClass(d, 'completed');
            else if (i === this.state.bs.step) DOM.addClass(d, 'active');
            else { DOM.removeClass(d, 'active'); DOM.removeClass(d, 'completed'); }
        });
        if (instr) instr.innerText = `Frunce y tensa fuerte: ${data.label}...`;
        if (svg) DOM.addClass(svg, 'fill-active');
        this.state.bs.timer = setTimeout(() => {
            if (!this.state.bs.active || this.state.bs.paused) return;
            if (instr) instr.innerText = `Suelta el aire y relaja: ${data.label}...`;
            if (svg) { DOM.removeClass(svg, 'fill-active'); DOM.addClass(svg, 'fill-relax'); }
            this.state.bs.timer = setTimeout(() => {
                if (!this.state.bs.active || this.state.bs.paused) return;
                this.state.bs.step++;
                this.runBS();
            }, 4000);
        }, 4000);
    },
    togglePause() {
        const btn = DOM.get('btn-bs-pause');
        const instr = DOM.get('bs-text-instruction');
        if (this.state.bs.paused) {
            this.state.bs.paused = false;
            if (btn) { btn.innerHTML = "⏸ Pausar"; DOM.removeClass(btn, 'paused'); }
            if (instr) instr.innerText = "Reanudando...";
            this.runBS();
        } else {
            this.state.bs.paused = true;
            clearTimeout(this.state.bs.timer);
            if (btn) { btn.innerHTML = "▶️ Reanudar"; DOM.addClass(btn, 'paused'); }
            if (instr) instr.innerText = "Ejercicio en pausa";
            DOM.getAll('.body-path').forEach(p => DOM.removeClass(p, 'fill-active'));
        }
    },
    finishBS() {
        this.stopBS();
        this.show('sos-screen-bs-final');
    },
    startCrisis() {
        this.show('sos-screen-suicide-breathing');
        this.state.crisis.cycles = 0;
        this.state.crisis.breathing = true;
        const btn = DOM.get('btn-crisis-continue');
        if (btn) DOM.setStyle(btn, { display: 'none' });
        DOM.getAll('.breath-dot').forEach(d => DOM.removeClass(d, 'active'));
        this.runCrisis();
    },
    runCrisis() {
        if (!this.state.crisis.breathing) return;
        if (this.state.crisis.cycles >= 3) {
            const timerText = DOM.get('crisis-timer-text');
            const breatheText = DOM.get('crisis-breathe-text');
            if(timerText) timerText.innerText = "¡Excelente trabajo!";
            if(breatheText) breatheText.innerText = "LISTO";
            DOM.setStyle(DOM.get('btn-crisis-continue'), { display: 'inline-block' });
            return;
        }
        const circle = DOM.get('crisis-breathe-circle');
        const text = DOM.get('crisis-breathe-text');
        const timer = DOM.get('crisis-timer-text');
        if (timer) timer.innerText = `Respiración ${this.state.crisis.cycles + 1} de 3`;
        DOM.getAll('.breath-dot').forEach((d, i) => {
            i === this.state.crisis.cycles ? DOM.addClass(d, 'active') : DOM.removeClass(d, 'active');
        });
        if (text) text.innerText = "INHALA";
        if (circle) circle.className = "crisis-breathe-circle inhale";
        this.state.crisis.timer = setTimeout(() => {
            if (!this.state.crisis.breathing) return;
            if (text) text.innerText = "RETÉN";
            if (circle) circle.className = "crisis-breathe-circle hold";
            this.state.crisis.timer = setTimeout(() => {
                if (!this.state.crisis.breathing) return;
                if (text) text.innerText = "EXHALA";
                if (circle) circle.className = "crisis-breathe-circle exhale";
                this.state.crisis.timer = setTimeout(() => {
                    if (!this.state.crisis.breathing) return;
                    this.state.crisis.cycles++;
                    this.runCrisis();
                }, 8000);
            }, 7000);
        }, 4000);
    },
    enableReasonsNext() {
        const btn = DOM.get('btn-reasons-next');
        if (btn) {
            btn.disabled = false;
            DOM.setStyle(btn, { opacity: "1", cursor: "pointer" });
            btn.innerText = "He reflexionado (Continuar)";
        }
    }
};

// ACCESIBILIDAD
const Accessibility = {
    init() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                DOM.getAll('.modal-overlay').forEach(m => {
                    if (getComputedStyle(m).display !== 'none') {
                        Modals.close(m);
                    }
                });
                const emotion = DOM.get('emotion-card-overlay');
                if (emotion && DOM.hasClass(emotion, 'active')) {
                    DOM.removeClass(emotion, 'active');
                    setTimeout(() => DOM.setStyle(emotion, { display: 'none' }), 300);
                }
                const sos = DOM.get('sos-overlay');
                if (sos && DOM.hasClass(sos, 'active') && window.closeSos) window.closeSos();
                document.body.style.overflow = 'auto';
            }
        });
    }
};

// INICIALIZADOR
document.addEventListener('DOMContentLoaded', () => {
    [Navigation, Animations, Accordion, ROI, Quiz, Tools, Jar, Emotions, Modals, SOS, Accessibility].forEach(module => {
        try {
            module.init();
        } catch (e) {
            console.error(`Error inicializando módulo:`, e);
        }
    });
});