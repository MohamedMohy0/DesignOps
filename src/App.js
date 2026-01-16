import React, { useEffect, useState } from "react";

// --- Helpers ---
const fetchUnsplash = async (query) => {
  try {
    // استخدام رابط مباشر يتخطى مشاكل الـ API Key أحياناً كحل احتياطي
    const res = await fetch(`https://api.unsplash.com/photos/random?query=${query}&client_id=nVcja462kRq0s3UzM3h4RNmnqhrG9M6WvLdvOMkvjkI`);
    if (!res.ok) throw new Error("API Limit reached");
    const data = await res.json();
    return data.urls.regular;
  } catch (e) {
    // في حال فشل الـ API، نستخدم المصدر المفتوح من Unsplash Source
    return `https://source.unsplash.com/featured/1600x900?${query}`;
  }
};

export default function DesignOps() {
  const [tab, setTab] = useState("fonts");
  const [darkMode, setDarkMode] = useState(false);

  // --- States ---
  const [allFonts, setAllFonts] = useState([]);
  const [displayedFonts, setDisplayedFonts] = useState([]);
  const [selectedFont, setSelectedFont] = useState("Inter");
  const [customText, setCustomText] = useState("الجمال في بساطة التصميم");
  const [iconQuery, setIconQuery] = useState("search");
  const [icons, setIcons] = useState([]);
  const [bgQuery, setBgQuery] = useState("nature");
  const [bgImage, setBgImage] = useState("https://images.unsplash.com/photo-1497215728101-856f4ea42174");
  const [themeColors, setThemeColors] = useState(["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"]);

  const s = getStyles(darkMode);

  // Fetch Fonts
  useEffect(() => {
    fetch("https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyBgpsVI9sySCuXPnioZFbXWyqjqEWP4Of0")
      .then(res => res.json())
      .then(data => {
        if(data.items) {
          setAllFonts(data.items);
          setDisplayedFonts(data.items.slice(0, 12));
        }
      });
  }, []);

  // Inject Google Font
  useEffect(() => {
    const link = document.createElement("link");
    link.href = `https://fonts.googleapis.com/css2?family=${selectedFont.replace(/ /g, "+")}&display=swap`;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, [selectedFont]);

  const refreshFonts = () => {
    const shuffled = [...allFonts].sort(() => 0.5 - Math.random());
    setDisplayedFonts(shuffled.slice(0, 12));
  };

  const fetchNewPalette = async () => {
    try {
      const res = await fetch("http://colormind.io/api/", {
        method: "POST",
        body: JSON.stringify({ model: "default" }),
      });
      const data = await res.json();
      const hexColors = data.result.map(rgb => 
        "#" + rgb.map(x => x.toString(16).padStart(2, '0')).join('')
      );
      setThemeColors(hexColors);
    } catch (e) {
      setThemeColors(themeColors.map(() => '#' + Math.floor(Math.random()*16777215).toString(16)));
    }
  };

  return (
    <div style={s.app}>
      {/* Sidebar */}
      <nav style={s.sidebar}>
        <div style={s.logoContainer}>
          <div style={s.logoIcon}>D</div>
          <div style={s.logoText}>STUDIO<span>OPS</span></div>
        </div>

        <div style={s.navLinks}>
          <NavBtn active={tab === "fonts"} icon="Aa" label="الخطوط" onClick={() => setTab("fonts")} darkMode={darkMode} />
          <NavBtn active={tab === "icons"} icon="★" label="الأيقونات" onClick={() => setTab("icons")} darkMode={darkMode} />
          <NavBtn active={tab === "bg"} icon="🖼" label="الخلفيات" onClick={() => setTab("bg")} darkMode={darkMode} />
          <NavBtn active={tab === "theme"} icon="🎨" label="الألوان" onClick={() => setTab("theme")} darkMode={darkMode} />
        </div>

        <button onClick={() => setDarkMode(!darkMode)} style={s.themeToggle}>
          {darkMode ? "☀️" : "🌙"}
        </button>
      </nav>

      {/* Main Content */}
      <main style={s.main}>
        <header style={s.topBar}>
          <h1 style={s.title}>
            مختبر <span style={{color: '#4f46e5'}}>{
              tab === "fonts" ? "الخطوط" : tab === "icons" ? "الأيقونات" : tab === "bg" ? "الخلفيات" : "الألوان"
            }</span>
          </h1>
          <p style={s.subtitle}>كل ما يحتاجه المصمم في مكان واحد</p>
        </header>

        {/* --- Fonts Tab --- */}
        {tab === "fonts" && (
          <div style={s.tabContent}>
            <div style={s.toolbar}>
              <input style={s.mainInput} placeholder="اكتب نصاً للتجربة..." value={customText} onChange={(e) => setCustomText(e.target.value)} />
              <button style={s.primaryBtn} onClick={refreshFonts}>تغيير المجموعة</button>
            </div>
            <div style={s.grid}>
              {displayedFonts.map(f => (
                <div key={f.family} style={{...s.card, border: selectedFont === f.family ? '2px solid #4f46e5' : '1px solid transparent'}} onClick={() => setSelectedFont(f.family)}>
                  <span style={s.cardLabel}>{f.family}</span>
                  <p style={{fontFamily: f.family, fontSize: '1.4rem', color: darkMode ? '#e5e7eb' : '#1f2937', margin: 0}}>{customText}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Icons Tab --- */}
        {tab === "icons" && (
          <div style={s.tabContent}>
            <div style={s.toolbar}>
              <input style={s.mainInput} placeholder="ابحث عن أيقونة بالإنجليزية (مثلاً: home)..." value={iconQuery} onChange={(e) => setIconQuery(e.target.value)} />
              <button style={s.primaryBtn} onClick={async () => {
                const res = await fetch(`https://api.iconify.design/search?query=${iconQuery}`);
                const data = await res.json();
                setIcons(data.icons || []);
              }}>بحث</button>
            </div>
            <div style={s.grid}>
              {icons.slice(0, 24).map(icon => (
                <div key={icon} style={s.iconCard}>
                  <img src={`https://api.iconify.design/${icon.replace(':', '/')}.svg?color=${darkMode ? 'white' : '4f46e5'}`} width="40" alt=""/>
                  <code style={s.iconCode}>{icon}</code>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Background Tab --- */}
        {tab === "bg" && (
          <div style={s.tabContent}>
            <div style={s.toolbar}>
              <input style={s.mainInput} value={bgQuery} onChange={e => setBgQuery(e.target.value)} placeholder="اكتب نوع الخلفية (مثلاً: Cyberpunk, Minimal)..."/>
              <button style={s.primaryBtn} onClick={async () => setBgImage(await fetchUnsplash(bgQuery))}>توليد صورة</button>
            </div>
            <div style={{...s.bgPreview, backgroundImage: `url(${bgImage})`}}>
              <button style={s.downloadBtnLarge} onClick={() => window.open(bgImage, '_blank')}>فتح الصورة بالحجم الكامل</button>
            </div>
          </div>
        )}

        {/* --- Palette Tab --- */}
        {tab === "theme" && (
          <div style={s.tabContent}>
             <div style={s.toolbar}>
               <button style={s.primaryBtn} onClick={fetchNewPalette}>توليد لوحة ألوان</button>
             </div>
             <div style={s.paletteGrid}>
               {themeColors.map((color, i) => (
                 <div key={i} style={s.card} onClick={() => navigator.clipboard.writeText(color)}>
                   <div style={{...s.colorBox, backgroundColor: color}}></div>
                   <div style={s.colorInfo}>
                     <strong style={{color: darkMode ? '#fff' : '#111'}}>{color.toUpperCase()}</strong>
                     <span style={s.copyHint}>انقر للنسخ</span>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        )}
      </main>
    </div>
  );
}

// --- Subcomponents ---
const NavBtn = ({active, icon, label, onClick, darkMode}) => (
  <button onClick={onClick} style={{
    width: '70px', height: '70px', borderRadius: '20px', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', transition: '0.3s',
    background: active ? '#4f46e5' : 'transparent',
    color: active ? '#fff' : (darkMode ? '#9ca3af' : '#6b7280'),
    boxShadow: active ? '0 10px 15px -3px rgba(79, 70, 229, 0.4)' : 'none'
  }}>
    <span style={{fontSize: '1.4rem'}}>{icon}</span>
    <span style={{fontSize: '0.75rem', marginTop: '5px', fontWeight: 'bold'}}>{label}</span>
  </button>
);

// --- Dynamic Styles ---
const getStyles = (darkMode) => ({
  app: { display: 'flex', minHeight: '100vh', direction: 'rtl', transition: 'all 0.4s ease',
    backgroundColor: darkMode ? '#0f172a' : '#f8fafc', 
    color: darkMode ? '#f1f5f9' : '#1e293b',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  sidebar: { width: '110px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', position: 'fixed', right: 0, height: '100vh', zIndex: 100,
    backgroundColor: darkMode ? '#1e293b' : '#ffffff', 
    borderLeft: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
  },
  logoContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '50px', gap: '8px' },
  logoIcon: { width: '50px', height: '50px', background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '24px', fontWeight: '900', boxShadow: '0 8px 16px rgba(79, 70, 229, 0.3)', transform: 'rotate(-5deg)' },
  logoText: { fontSize: '12px', fontWeight: '900', letterSpacing: '1px', color: darkMode ? '#fff' : '#4f46e5' },
  navLinks: { display: 'flex', flexDirection: 'column', gap: '25px', flex: 1 },
  themeToggle: { width: '50px', height: '50px', borderRadius: '50%', border: 'none', cursor: 'pointer', fontSize: '1.3rem', marginBottom: '30px', transition: '0.3s',
    backgroundColor: darkMode ? '#334155' : '#f1f5f9'
  },
  main: { marginRight: '110px', flex: 1, padding: '60px' },
  topBar: { marginBottom: '50px' },
  title: { fontSize: '2.5rem', fontWeight: '900', margin: 0 },
  subtitle: { color: '#64748b', marginTop: '10px', fontSize: '1.1rem' },
  toolbar: { display: 'flex', gap: '15px', marginBottom: '40px', maxWidth: '850px' },
  mainInput: { flex: 1, padding: '18px 25px', borderRadius: '16px', outline: 'none', transition: '0.3s', fontSize: '1rem',
    border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`,
    background: darkMode ? '#1e293b' : '#fff',
    color: darkMode ? '#fff' : '#1e293b'
  },
  primaryBtn: { padding: '18px 35px', borderRadius: '16px', border: 'none', background: '#4f46e5', color: '#fff', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)', transition: '0.3s' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' },
  card: { padding: '35px', borderRadius: '24px', cursor: 'pointer', transition: '0.3s',
    backgroundColor: darkMode ? '#1e293b' : '#fff',
    boxShadow: darkMode ? '0 10px 20px rgba(0,0,0,0.2)' : '0 10px 20px rgba(0,0,0,0.03)'
  },
  cardLabel: { fontSize: '0.8rem', color: '#94a3b8', marginBottom: '15px', display: 'block', fontWeight: '600' },
  iconCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '30px', borderRadius: '24px', gap: '15px',
    backgroundColor: darkMode ? '#1e293b' : '#fff',
    boxShadow: darkMode ? '0 10px 20px rgba(0,0,0,0.2)' : '0 10px 20px rgba(0,0,0,0.03)'
  },
  iconCode: { fontSize: '0.75rem', color: '#4f46e5', background: darkMode ? '#334155' : '#f5f3ff', padding: '5px 12px', borderRadius: '8px' },
  paletteGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '25px' },
  colorBox: { height: '180px', borderRadius: '18px' },
  colorInfo: { padding: '20px', textAlign: 'center' },
  copyHint: { display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginTop: '5px' },
  bgPreview: { height: '65vh', borderRadius: '35px', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${darkMode ? '#334155' : '#e2e8f0'}`, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' },
  downloadBtnLarge: { padding: '20px 50px', borderRadius: '100px', background: 'rgba(255,255,255,0.95)', color: '#1e293b', border: 'none', cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 10px 20px rgba(0,0,0,0.1)', fontSize: '1rem' }
});