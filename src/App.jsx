import React, { useEffect, useState } from "react";
import { ArrowUpLeft, ArrowUpRight, ExternalLink, Facebook, Instagram, Music2, Menu, MessageCircle, Monitor, Palette, Smartphone, X, LockKeyhole, Trash2, LogOut, Save, Languages } from "lucide-react";
import { auth, db, firebaseReady } from "./firebase";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { addDoc, collection, deleteDoc, doc, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";

const ADMIN_EMAIL = "mohabkhaled207@gmail.com";

const initialProject = {
  title: "SKIP STORE",
  category: "E-commerce Website",
  description: "متجر إلكتروني لعرض وبيع الملابس الشبابية، بتجربة تصفح واضحة وتصميم متجاوب.",
  url: "https://skip-store2000-y4a.vercel.app/",
  image: "",
  featured: true
};

const copy = {
  ar: {
    nav: ["الرئيسية","من أنا","خدماتي","أعمالي","تواصل"],
    hello: "مرحباً، أنا", role: "مصمم ومطور مواقع ويب",
    intro: "أحوّل الأفكار إلى تجارب رقمية استثنائية، بتصميم يجمع بين القوة والبساطة والأداء.",
    work: "استكشف أعمالي", contact: "ابدأ مشروعك", scroll: "اكتشف المزيد",
    eyebrow: "تصميم رقمي برؤية مختلفة", about: "أصنع حضورك الرقمي باحتراف",
    aboutText: "أهتم ببناء مواقع عصرية تجمع بين الهوية البصرية القوية وسهولة الاستخدام. من الفكرة إلى الإطلاق، أركز على التفاصيل التي تصنع فرقاً حقيقياً.",
    services: "ماذا أقدم؟", servicesSub: "حلول رقمية متكاملة لعلامتك التجارية",
    projects: "مشاريع مختارة", projectsSub: "بداية معرض أعمالي — والمزيد قريباً",
    view: "زيارة المشروع", details: "تفاصيل المشروع", contactTitle: "لنبنِ شيئاً مميزاً معاً",
    contactText: "لديك فكرة أو مشروع؟ يسعدني أن نتحدث ونحوّلها إلى واقع.",
    whatsapp: "تواصل عبر واتساب", footer: "كل الحقوق محفوظة",
    admin: "إدارة الأعمال", login: "دخول الإدارة", email: "البريد الإلكتروني",
    password: "كلمة المرور", signIn: "تسجيل الدخول", add: "إضافة مشروع",
    title: "اسم المشروع", category: "التصنيف", description: "وصف المشروع",
    url: "رابط المشروع", image: "رابط صورة المعاينة (اختياري)", save: "حفظ المشروع",
    cancel: "إلغاء", logout: "خروج", empty: "لا توجد مشاريع إضافية حالياً.",
    firebaseMissing: "أضف إعدادات Firebase في ملف البيئة لتفعيل حفظ المشاريع ولوحة الإدارة.",
    loginError: "تعذر تسجيل الدخول. تحقق من بيانات Firebase وحساب الإدارة.",
    saved: "تم حفظ المشروع في Firestore.", edit: "تعديل", update: "حفظ التعديلات", cancelEdit: "إلغاء التعديل", delete: "حذف", language: "English"
  },
  en: {
    nav: ["Home","About","Services","Work","Contact"],
    hello: "Hello, I'm", role: "Web Designer & Developer",
    intro: "I turn ideas into exceptional digital experiences through bold design, clarity, and performance.",
    work: "Explore My Work", contact: "Start a Project", scroll: "Discover more",
    eyebrow: "Digital craft with a different vision", about: "Building your digital presence",
    aboutText: "I create modern websites that combine a strong visual identity with effortless usability. From concept to launch, I focus on the details that make a real difference.",
    services: "What I Do", servicesSub: "End-to-end digital solutions for your brand",
    projects: "Selected Projects", projectsSub: "The beginning of my portfolio — more coming soon",
    view: "Visit project", details: "Project details", contactTitle: "Let's build something remarkable",
    contactText: "Have an idea or a project? Let's talk and turn it into reality.",
    whatsapp: "Chat on WhatsApp", footer: "All rights reserved",
    admin: "Manage Work", login: "Admin Login", email: "Email address",
    password: "Password", signIn: "Sign in", add: "Add project",
    title: "Project name", category: "Category", description: "Project description",
    url: "Project URL", image: "Preview image URL (optional)", save: "Save project",
    cancel: "Cancel", logout: "Log out", empty: "No additional projects yet.",
    firebaseMissing: "Add Firebase configuration to the environment file to enable Firestore and admin tools.",
    loginError: "Login failed. Check Firebase settings and admin credentials.",
    saved: "Project saved to Firestore.", edit: "Edit", update: "Save changes", cancelEdit: "Cancel edit", delete: "Delete", language: "العربية"
  }
};

function App() {
  const [lang, setLang] = useState("ar");
  const [projects, setProjects] = useState([initialProject]);
  const [user, setUser] = useState(null);
  const [adminOpen, setAdminOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [form, setForm] = useState({email:"", password:""});
  const [projectForm, setProjectForm] = useState({title:"", category:"", description:"", url:"", image:""});
  const [editingId, setEditingId] = useState(null);
  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const t = copy[lang];
  const rtl = lang === "ar";
  const wa = "https://wa.me/hobaaa_khaled?s=t";
  const arrow = rtl ? <ArrowUpLeft size={17}/> : <ArrowUpRight size={17}/>;

  useEffect(() => {
    if (!firebaseReady || !auth) return;
    return onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser && currentUser.email?.toLowerCase() !== ADMIN_EMAIL) {
        await signOut(auth);
        setUser(null);
        setError("هذا الحساب غير مصرح له بإدارة الموقع.");
        return;
      }
      setUser(currentUser);
    });
  }, []);

  useEffect(() => {
    if (!firebaseReady || !db) return;
    return onSnapshot(collection(db, "portfolioProjects"), snap => {
      const remote = snap.docs.map(d => ({id:d.id, ...d.data()}));
      remote.sort((a,b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setProjects([initialProject, ...remote.filter(p => p.url !== initialProject.url)]);
    }, err => setError(err?.code === "permission-denied" ? "ليس لديك صلاحية قراءة المشاريع. راجع قواعد Firestore." : "تعذر تحميل المشاريع من Firestore. تحقق من الاتصال وإعدادات Firebase."));
  }, []);

  const services = [
    {icon:<Monitor/>, title:rtl?"تطوير المواقع":"Web Development", desc:rtl?"مواقع سريعة ومتجاوبة تعكس هوية مشروعك":"Fast, responsive websites built around your brand."},
    {icon:<Palette/>, title:rtl?"تصميم UI/UX":"UI/UX Design", desc:rtl?"واجهات جذابة وتجربة استخدام مدروسة":"Polished interfaces and thoughtful user journeys."},
    {icon:<Smartphone/>, title:rtl?"المتاجر الإلكترونية":"E-commerce", desc:rtl?"متاجر رقمية تسهّل عرض المنتجات والبيع":"Digital storefronts that make selling simple."}
  ];

  async function login(e) {
    e.preventDefault(); setError("");
    if (!firebaseReady || !auth) return setError(t.firebaseMissing);
    if (form.email.trim().toLowerCase() !== ADMIN_EMAIL) {
      setError("البريد الإلكتروني غير مصرح له بالدخول.");
      return;
    }
    try {
      const credential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, form.password);
      setUser(credential.user);
      setLoginOpen(false);
      setAdminOpen(true);
      setForm({email:"", password:""});
    } catch {
      setError(t.loginError);
    }
  }

  function resetProjectForm() {
    setProjectForm({title:"", category:"", description:"", url:"", image:""});
    setEditingId(null);
  }

  function editProject(project) {
    setProjectForm({title:project.title || "", category:project.category || "", description:project.description || "", url:project.url || "", image:project.image || ""});
    setEditingId(project.id);
    setError("");
    setNotice("");
    setAdminOpen(true);
    setLoginOpen(false);
  }

  async function saveProject(e) {
    e.preventDefault(); setError(""); setNotice("");
    if (!db || !isAdmin) return setError("يجب تسجيل الدخول بحساب الإدارة أولاً.");
    if (!(projectForm.url.startsWith("https://") || projectForm.url.startsWith("http://"))) return setError("Project URL must start with https://");
    if (projectForm.image && !(projectForm.image.startsWith("https://") || projectForm.image.startsWith("http://"))) return setError("Image URL must start with https://");
    setSaving(true);
    try {
      const cleanForm = Object.fromEntries(Object.entries(projectForm).map(([key, value]) => [key, value.trim()]));
      const payload = {...cleanForm, updatedAt:serverTimestamp(), updatedBy:user.uid};
      if (editingId) {
        await updateDoc(doc(db, "portfolioProjects", editingId), payload);
      } else {
        await addDoc(collection(db, "portfolioProjects"), {...payload, createdAt:serverTimestamp(), createdBy:user.uid});
      }
      resetProjectForm();
      setNotice(t.saved);
    } catch (err) {
      setError(err?.code === "permission-denied"
        ? "تم رفض الحفظ من Firestore. تحقق من صلاحية حساب المالك وقواعد قاعدة البيانات."
        : err?.code === "unavailable"
          ? "تعذر الاتصال بـ Firestore. تحقق من الإنترنت ثم حاول مرة أخرى."
          : err?.code === "not-found"
            ? "المشروع المراد تعديله لم يعد موجوداً. حدّث الصفحة ثم حاول مجدداً."
            : "فشل حفظ المشروع في Firestore. لم يتم تأكيد الحفظ؛ تحقق من الاتصال والصلاحيات.");
    } finally { setSaving(false); }
  }

  async function removeProject(id) {
    if (!db || !isAdmin || !id || deletingId) return;
    if (!window.confirm("هل تريد حذف هذا المشروع نهائياً؟")) return;
    setError(""); setNotice(""); setDeletingId(id);
    try {
      await deleteDoc(doc(db, "portfolioProjects", id));
      setNotice("تم حذف المشروع من Firestore بنجاح.");
      if (editingId === id) resetProjectForm();
    } catch (err) {
      setError(err?.code === "permission-denied" ? "تم رفض الحذف. تأكد من تسجيل الدخول بحساب المالك ونشر قواعد Firestore الصحيحة." : err?.code === "not-found" ? "المشروع محذوف بالفعل أو لم يعد موجوداً." : "فشل حذف المشروع من Firestore. تحقق من الاتصال والصلاحيات.");
    } finally { setDeletingId(null); }
  }

  return <div className="app" dir={rtl?"rtl":"ltr"}>
    <header className="topbar">
      <a className="brand" href="#home"><span className="brand-mark">MK</span><span><b>Mohab Khaled</b><small>WEB DESIGNER & DEVELOPER</small></span></a>
      <nav className={mobileOpen?"nav open":"nav"}>{t.nav.map((n,i)=><a key={n} href={["#home","#about","#services","#work","#contact"][i]} onClick={()=>setMobileOpen(false)}>{n}</a>)}</nav>
      <div className="top-actions">
        <button className="language" onClick={()=>setLang(rtl?"en":"ar")}><Languages size={16}/>{t.language}</button>
        <button className="admin-link" onClick={()=>{setAdminOpen(true); if(!user)setLoginOpen(true)}}><LockKeyhole size={15}/>{t.admin}</button>
        <button className="menu" onClick={()=>setMobileOpen(!mobileOpen)} aria-label="Menu">{mobileOpen?<X/>:<Menu/>}</button>
      </div>
    </header>

    <main>
      <section className="hero" id="home">
        <div className="hero-glow glow-one"/><div className="hero-glow glow-two"/>
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow"><i/> {t.eyebrow}</span>
            <p className="hello">{t.hello}</p>
            <h1>Mohab <span>Khaled</span><em>.</em></h1>
            <h2>{t.role}</h2>
            <p className="intro">{t.intro}</p>
            <div className="hero-buttons"><a className="button primary" href="#work">{t.work}{arrow}</a><a className="button secondary" href="#contact">{t.contact}<MessageCircle size={17}/></a></div>
            <div className="hero-meta"><span><b>01</b> / DIGITAL CREATIVE</span><span className="meta-line"/><span>BASED IN ALEXANDRIA, EGYPT</span></div>
          </div>
          <div className="portrait-wrap">
            <div className="portrait-frame"><img src="/mohab.png" alt="Mohab Khaled" className="portrait-img" /></div>
            <div className="orbit orbit-a"/><div className="orbit orbit-b"/>
            <div className="floating-card card-top"><span className="pulse"/> AVAILABLE FOR PROJECTS</div>
            <div className="floating-card card-bottom"><b>01</b><span>{rtl?"مشروع منشور":"LIVE PROJECT"}</span></div>
          </div>
        </div>
        <a className="scroll" href="#about"><span/>{t.scroll}</a>
      </section>

      <section className="section about" id="about">
        <div className="section-kicker">01 — ABOUT</div><div className="section-content">
          <h2>{t.about}</h2><p>{t.aboutText}</p>
          <div className="about-tags"><span>WEB DESIGN</span><span>DEVELOPMENT</span><span>DIGITAL EXPERIENCE</span></div>
        </div>
      </section>

      <section className="section services" id="services">
        <div className="section-heading"><div><div className="section-kicker">02 — SERVICES</div><h2>{t.services}</h2></div><p>{t.servicesSub}</p></div>
        <div className="service-grid">{services.map((s,i)=><article className="service-card" key={i}><div className="service-number">0{i+1}</div><div className="service-icon">{s.icon}</div><h3>{s.title}</h3><p>{s.desc}</p><span className="service-arrow">{arrow}</span></article>)}</div>
      </section>

      <section className="section work" id="work">
        <div className="section-heading"><div><div className="section-kicker">03 — SELECTED WORK</div><h2>{t.projects}</h2></div><p>{t.projectsSub}</p></div>
        <div className="project-grid">{projects.map((p,i)=><article className="project-card" key={p.id||p.url}>
          <div className="project-visual">
            {p.image?<img src={p.image} alt={p.title}/>:<div className={"project-art art-"+(i%3)}><span className="art-label">DIGITAL EXPERIENCE / 0{i+1}</span><b>{p.title}</b><small>{p.category}</small><div className="art-orb"/></div>}
            <a className="project-open" href={p.url} target="_blank" rel="noreferrer" aria-label={t.view}><ExternalLink/></a>
          </div>
          <div className="project-info"><div><span className="project-category">{p.category}</span><h3>{p.title}</h3></div><a href={p.url} target="_blank" rel="noreferrer" className="text-link">{t.view}{arrow}</a></div>
          <p className="project-description">{p.description}</p>
          {isAdmin && p.id && <div className="project-admin-actions"><button className="delete-project" onClick={()=>editProject(p)}>{t.edit}</button><button className="delete-project" disabled={Boolean(deletingId)} onClick={()=>removeProject(p.id)}><Trash2 size={14}/>{deletingId===p.id?"...":t.delete}</button></div>}
        </article>)}</div>
        {projects.length===1&&<p className="coming-soon">{rtl?"هذه أولى خطوات المعرض — أضف مشاريعك القادمة من لوحة الإدارة.":"This is the first piece. Add future projects from the admin panel."}</p>}
      </section>

      <section className="contact-section" id="contact"><div className="contact-orb"/><div className="section-kicker">04 — CONTACT</div><h2>{t.contactTitle}</h2><p>{t.contactText}</p><a className="button primary" href={wa} target="_blank" rel="noreferrer">{t.whatsapp}<MessageCircle size={18}/></a></section>
    </main>

    <footer><a className="brand" href="#home"><span className="brand-mark">MK</span><span><b>Mohab Khaled</b><small>DREAM. DESIGN. DEVELOP.</small></span></a><div className="footer-copy">© {new Date().getFullYear()} MOHAB KHALED. {t.footer}.</div><div className="footer-links"><a href="#work">WORK</a><a href="#contact">CONTACT</a><a className="social-link" href={wa} target="_blank" rel="noreferrer" aria-label="WhatsApp" title="WhatsApp"><MessageCircle size={18}/></a><a className="social-link" href="https://www.instagram.com/hobaaa_khaled?rpxt=MTRnazc0dnVzOThhbg==" target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram"><Instagram size={18}/></a><a className="social-link" href="https://www.facebook.com/share/19xgExeYK9/" target="_blank" rel="noreferrer" aria-label="Facebook" title="Facebook"><Facebook size={18}/></a><a className="social-link" href="https://www.tiktok.com/@mohab.k__" target="_blank" rel="noreferrer" aria-label="TikTok" title="TikTok"><Music2 size={18}/></a></div></footer>

    {(loginOpen||adminOpen)&&<div className="modal-backdrop" onClick={()=>{setLoginOpen(false);setAdminOpen(false);resetProjectForm()}}><div className="modal" onClick={e=>e.stopPropagation()}>
      <button className="modal-close" onClick={()=>{setLoginOpen(false);setAdminOpen(false);resetProjectForm()}}><X/></button>
      {!isAdmin?<><div className="section-kicker">PRIVATE ACCESS</div><h2>{t.login}</h2><form onSubmit={login} className="admin-form"><label>{t.email}<input type="email" autoComplete="username" placeholder={t.email} required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label><label>{t.password}<input type="password" autoComplete="current-password" placeholder={t.password} required value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></label><button className="button primary" type="submit">{t.signIn}<LockKeyhole size={16}/></button></form></>:<><div className="section-kicker">CONTROL CENTER</div><h2>{t.admin}</h2><button className="logout" onClick={()=>signOut(auth)}><LogOut size={15}/>{t.logout}</button><form className="admin-form" onSubmit={saveProject}>{[["title","text"],["category","text"],["description","textarea"],["url","url"],["image","url"]].map(([key,type])=><label key={key}>{t[key]}{type==="textarea"?<textarea required value={projectForm[key]} onChange={e=>setProjectForm({...projectForm,[key]:e.target.value})}/>:<input required={key!=="image"} type={type} value={projectForm[key]} onChange={e=>setProjectForm({...projectForm,[key]:e.target.value})}/>}</label>)}<button className="button primary" disabled={saving} type="submit"><Save size={16}/>{saving?"...":editingId?t.update:t.save}</button>{editingId&&<button type="button" className="button secondary" onClick={resetProjectForm}>{t.cancelEdit}</button>}</form></>}
      {error&&<p className="form-error">{error}</p>}{notice&&<p className="form-success">{notice}</p>}
    </div></div>}
  </div>
}
export default App;