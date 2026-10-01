import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { connectWallet, isMetaMaskInstalled, shortenAddress } from './utils/wallet.js'
import { donate, getTotalRaised } from './utils/contract.js'

/* ─── Donation Modal ─────────────────────────────────────── */
function DonationModal({ campaign, onClose, onDonate }) {
    const [amount, setAmount] = useState('0.01')
    const [status, setStatus] = useState('idle')  // idle | loading | success | error
    const [txHash, setTxHash] = useState('')
    const [errMsg, setErrMsg] = useState('')

    async function handleDonate() {
        if (!amount || parseFloat(amount) <= 0) return
        setStatus('loading')
        setErrMsg('')
        try {
            const tx = await onDonate(amount)
            setTxHash(tx.hash)
            setStatus('success')
        } catch (err) {
            setErrMsg(err?.reason || err?.message || 'Transaction failed.')
            setStatus('error')
        }
    }

    // Close on backdrop click
    function handleBackdrop(e) {
        if (e.target === e.currentTarget) onClose()
    }

    return (
        <div className="modal-backdrop" onClick={handleBackdrop}>
            <div className="modal">
                {/* Header */}
                <div className="modal-header">
                    <div>
                        <p className="modal-campaign-tag">{campaign.tag}</p>
                        <h2 className="modal-title">{campaign.title}</h2>
                    </div>
                    <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
                </div>

                {/* Body */}
                <div className="modal-body">
                    {status !== 'success' ? (
                        <>
                            <label className="modal-label" htmlFor="donate-amount">
                                Donation Amount (MATIC)
                            </label>
                            <input
                                id="donate-amount"
                                className="modal-input"
                                type="number"
                                min="0.001"
                                step="0.001"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                disabled={status === 'loading'}
                                placeholder="e.g. 0.01"
                            />

                            {/* Quick-pick buttons */}
                            <div className="modal-quick-picks">
                                {['0.01', '0.05', '0.1', '0.5'].map(v => (
                                    <button
                                        key={v}
                                        className={`quick-pick ${amount === v ? 'active' : ''}`}
                                        onClick={() => setAmount(v)}
                                        disabled={status === 'loading'}
                                    >
                                        {v} MATIC
                                    </button>
                                ))}
                            </div>

                            {errMsg && <p className="modal-error">{errMsg}</p>}

                            <button
                                className="modal-donate-btn"
                                onClick={handleDonate}
                                disabled={status === 'loading' || !amount}
                            >
                                {status === 'loading' ? (
                                    <><span className="spinner" /> Confirming…</>
                                ) : (
                                    'Donate Now'
                                )}
                            </button>
                        </>
                    ) : (
                        /* Success state */
                        <div className="modal-success">
                            <span className="success-icon">✅</span>
                            <h3>Donation Confirmed!</h3>
                            <p>Thank you for contributing <strong>{amount} MATIC</strong> to {campaign.title}.</p>
                            <div className="tx-hash-box">
                                <span className="tx-hash-label">Transaction Hash</span>
                                <a
                                    className="tx-hash-link"
                                    href={`https://mumbai.polygonscan.com/tx/${txHash}`}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    {txHash.slice(0, 20)}…{txHash.slice(-8)}
                                </a>
                            </div>
                            <button className="modal-close-btn" onClick={onClose}>Close</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

/* ─── Navbar ─────────────────────────────────────────────── */
function Navbar({ account, onConnect }) {
    const [open, setOpen] = useState(false)
    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <span className="logo-icon">🦅</span>
                <span className="logo-text">FDRS</span>
            </div>

            {/* Desktop nav links */}
            <ul className={`navbar-links${open ? ' nav-open' : ''}`}>
                <li><a href="#campaigns" onClick={() => setOpen(false)}>Campaigns</a></li>
                <li><a href="#how" onClick={() => setOpen(false)}>How It Works</a></li>
                <li><a href="#about" onClick={() => setOpen(false)}>About Us</a></li>
                {/* Wallet button inside mobile menu too */}
                <li className="nav-wallet-mobile">
                    {account
                        ? <span className="wallet-address">✅ {shortenAddress(account)}</span>
                        : isMetaMaskInstalled()
                            ? <button className="btn-connect" onClick={onConnect}>Connect Wallet</button>
                            : <a className="btn-connect" href="https://metamask.io/download/" target="_blank" rel="noreferrer">Install MetaMask</a>
                    }
                </li>
            </ul>

            {/* Right side: wallet (desktop) + hamburger */}
            <div className="navbar-right">
                <div className="navbar-wallet">
                    {account
                        ? <span className="wallet-address">✅ {shortenAddress(account)}</span>
                        : isMetaMaskInstalled()
                            ? <button className="btn-connect" onClick={onConnect}>Connect Wallet</button>
                            : <a className="btn-connect" href="https://metamask.io/download/" target="_blank" rel="noreferrer">Install MetaMask</a>
                    }
                </div>
                <button
                    className={`hamburger${open ? ' ham-open' : ''}`}
                    onClick={() => setOpen(o => !o)}
                    aria-label="Toggle menu"
                >
                    <span /><span /><span />
                </button>
            </div>
        </nav>
    )
}

/* ─── Hero ───────────────────────────────────────────────── */
function Hero({ totalRaised }) {
    return (
        <section className="hero">
            <div className="hero-inner">
                <span className="hero-tag">Official Disaster Relief Portal</span>
                <h1 className="hero-title">Aid Where It's Needed Most</h1>
                <p className="hero-desc">
                    The Falcons Disaster Response System enables transparent, blockchain-verified
                    donations directly to verified disaster zones. Every rupee is tracked and
                    accounted for.
                </p>
                <div className="total-raised-banner">
                    <span className="total-raised-label">Total Raised On-Chain</span>
                    <span className="total-raised-value">
                        {totalRaised !== null ? `${totalRaised} MATIC` : 'Loading…'}
                    </span>
                </div>
                <div className="hero-btns">
                    <button className="btn-primary">Donate Now</button>
                    <button className="btn-outline">View All Campaigns</button>
                </div>
            </div>
        </section>
    )
}

/* ─── Campaigns ──────────────────────────────────────────── */
const campaigns = [
    {
        id: 1,
        tag: 'Flood Relief',
        title: 'Assam Floods 2025',
        desc: "Providing emergency food, shelter, and medical aid to over 40,000 displaced families across Assam's Brahmaputra valley zone.",
        raised: '₹18,40,000',
        goal: '₹30,00,000',
        percent: 61,
        status: 'Active',
        upiId: 'fdrs.assam@fdrsrelief',
        img: 'flood',
        details: {
            overview: "Unprecedented monsoon rains have caused the Brahmaputra river to overflow, submerging over 2,800 villages across 28 districts of Assam. The floods have displaced more than 40,000 families and destroyed standing crops on 1.2 lakh hectares of farmland.",
            impact: [
                '40,000+ families displaced and moved to relief camps',
                'Over 1.2 lakh hectares of farmland submerged',
                '28 districts affected — Barpeta, Morigaon, Darrang among worst hit',
                'Primary schools and health centres submerged in 14 blocks',
            ],
            howFundsUsed: [
                'Emergency food kits and clean drinking water',
                'Temporary shelter and tarpaulin distribution',
                'Medical aid and mobile health units',
                'Livestock rescue and fodder supply',
            ],
            organizer: 'Ministry of Home Affairs — NDRF Unit IV',
            verifiedOn: '14 June 2025',
            location: 'Assam, Northeast India',
        },
    },
    {
        id: 2,
        tag: 'Earthquake',
        title: 'Uttarakhand Quake Response',
        desc: 'Emergency rescue operations and structural relief for communities affected by the 6.1 magnitude earthquake near Chamoli district.',
        raised: '₹9,80,000',
        goal: '₹20,00,000',
        percent: 49,
        status: 'Active',
        upiId: 'fdrs.quake@fdrsrelief',
        img: 'quake',
        details: {
            overview: "A 6.1 magnitude earthquake struck near Chamoli district in Uttarakhand on 8 February 2025, causing widespread structural damage in remote Himalayan villages. Landslides triggered by the quake have blocked key roads, hampering rescue efforts.",
            impact: [
                '7 villages completely cut off by landslides',
                'Over 600 houses partially or fully collapsed',
                'Highway NH-7 blocked at 3 critical points',
                '2,200+ residents evacuated to safer zones',
            ],
            howFundsUsed: [
                'NDRF rapid response team deployment',
                'Structural assessment and debris clearance',
                'Temporary prefabricated housing units',
                'Trauma counselling and medical support',
            ],
            organizer: 'SDRF Uttarakhand & NDRF Battalion 13',
            verifiedOn: '10 February 2025',
            location: 'Chamoli, Uttarakhand',
        },
    },
    {
        id: 3,
        tag: 'Cyclone',
        title: 'Cyclone Reena – Odisha',
        desc: 'Rebuilding homes, restoring power infrastructure, and supplying clean drinking water to coastal villages ravaged by the storm.',
        raised: '₹24,10,000',
        goal: '₹25,00,000',
        percent: 96,
        status: 'Closing Soon',
        upiId: 'fdrs.cyclone@fdrsrelief',
        img: 'cyclone',
        details: {
            overview: "Cyclone Reena made landfall on the Odisha coast near Puri on 22 April 2025 with wind speeds of 185 km/h. The severe cyclonic storm flattened hundreds of homes and severed power to 4 lakh households across coastal districts.",
            impact: [
                '4 lakh households without electricity for 8+ days',
                '1,100+ thatched homes fully destroyed',
                'Freshwater contamination in 180 coastal villages',
                '35 km of fishing coast declared temporarily no-access',
            ],
            howFundsUsed: [
                'Rebuilding pucca homes for the most vulnerable',
                'Restoration of power distribution lines',
                'Water purification tablets and tank repair',
                'Fisher community livelihood recovery grants',
            ],
            organizer: 'Odisha Disaster Rapid Action Force (ODRAF)',
            verifiedOn: '25 April 2025',
            location: 'Puri & Kendrapara, Odisha',
        },
    },
]

/* ─── Campaign visual banners (inline SVG by type) ────────── */
const BANNERS = {
    flood: (
        <svg viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg" className="card-banner-svg">
            <defs>
                <linearGradient id="sky-f" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0a1628" />
                    <stop offset="100%" stopColor="#1a3a5c" />
                </linearGradient>
                <linearGradient id="water-f" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1c4f8a" />
                    <stop offset="100%" stopColor="#0d2a4e" />
                </linearGradient>
            </defs>
            <rect width="400" height="160" fill="url(#sky-f)" />
            {/* Clouds */}
            <ellipse cx="80" cy="35" rx="45" ry="18" fill="#223355" opacity="0.7" />
            <ellipse cx="110" cy="28" rx="35" ry="14" fill="#2a4070" opacity="0.8" />
            <ellipse cx="280" cy="40" rx="55" ry="20" fill="#1e3050" opacity="0.7" />
            <ellipse cx="310" cy="30" rx="40" ry="15" fill="#253860" opacity="0.8" />
            {/* Submerged house silhouettes */}
            <rect x="40" y="85" width="50" height="30" rx="2" fill="#0d2030" opacity="0.9" />
            <polygon points="40,85 65,62 90,85" fill="#0e2535" />
            <rect x="160" y="75" width="60" height="40" rx="2" fill="#0b1e30" />
            <polygon points="160,75 190,50 220,75" fill="#0e2535" />
            <rect x="290" y="88" width="45" height="28" rx="2" fill="#0d2030" />
            <polygon points="290,88 312,68 335,88" fill="#0e2535" />
            {/* Water */}
            <rect x="0" y="105" width="400" height="55" fill="url(#water-f)" />
            {/* Waves */}
            <path d="M0,108 Q50,100 100,108 Q150,116 200,108 Q250,100 300,108 Q350,116 400,108 L400,160 L0,160Z" fill="#1a4a80" opacity="0.5" />
            <path d="M0,118 Q40,112 80,118 Q120,124 160,118 Q200,112 240,118 Q280,124 320,118 Q360,112 400,118 L400,160 L0,160Z" fill="#0d2a4e" opacity="0.6" />
            {/* Boat */}
            <path d="M170,108 Q185,102 200,108 L196,116 H174Z" fill="#c8872a" />
            <rect x="185" y="100" width="2" height="10" fill="#e0a040" />
            <path d="M187,100 L195,104 L187,108Z" fill="#e03030" opacity="0.9" />
            {/* Label */}
            <text x="200" y="150" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="10" fontFamily="Inter,sans-serif">ASSAM FLOODS 2025</text>
        </svg>
    ),
    quake: (
        <svg viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg" className="card-banner-svg">
            <defs>
                <linearGradient id="sky-q" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a0e08" />
                    <stop offset="100%" stopColor="#3d2010" />
                </linearGradient>
            </defs>
            <rect width="400" height="160" fill="url(#sky-q)" />
            {/* Dust haze */}
            <ellipse cx="200" cy="80" rx="220" ry="60" fill="#6b3a1a" opacity="0.25" />
            {/* Mountains */}
            <polygon points="0,160 80,60 160,160" fill="#2a1408" />
            <polygon points="60,160 180,30 300,160" fill="#1e0e06" />
            <polygon points="200,160 320,50 400,160" fill="#251208" />
            <polygon points="280,160 370,75 400,160" fill="#2a1408" />
            {/* Crack lines */}
            <polyline points="180,160 190,130 175,110 195,80 180,50" stroke="#cc4400" strokeWidth="2" fill="none" opacity="0.7" />
            <polyline points="220,160 215,140 225,115 210,95" stroke="#cc4400" strokeWidth="1.5" fill="none" opacity="0.5" />
            {/* Rubble */}
            <rect x="100" y="140" width="18" height="12" rx="1" fill="#6b3a1a" transform="rotate(-15,100,140)" />
            <rect x="130" y="145" width="22" height="10" rx="1" fill="#5a2e14" transform="rotate(8,130,145)" />
            <rect x="240" y="143" width="16" height="11" rx="1" fill="#6b3a1a" transform="rotate(-10,240,143)" />
            <rect x="270" y="148" width="20" height="9" rx="1" fill="#5a2e14" transform="rotate(5,270,148)" />
            {/* Label */}
            <text x="200" y="155" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="Inter,sans-serif">UTTARAKHAND QUAKE RESPONSE</text>
        </svg>
    ),
    cyclone: (
        <svg viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg" className="card-banner-svg">
            <defs>
                <linearGradient id="sky-c" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0a0e18" />
                    <stop offset="100%" stopColor="#1a2238" />
                </linearGradient>
                <radialGradient id="eye" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#2a3a5a" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#0a0e18" stopOpacity="0" />
                </radialGradient>
            </defs>
            <rect width="400" height="160" fill="url(#sky-c)" />
            {/* Cyclone bands */}
            <circle cx="200" cy="70" r="90" fill="none" stroke="#2a3a60" strokeWidth="18" opacity="0.5" />
            <circle cx="200" cy="70" r="65" fill="none" stroke="#1e2e50" strokeWidth="14" opacity="0.5" />
            <circle cx="200" cy="70" r="40" fill="none" stroke="#162240" strokeWidth="10" opacity="0.6" />
            <circle cx="200" cy="70" r="18" fill="url(#eye)" />
            {/* Rain streaks */}
            {[30, 70, 120, 170, 230, 280, 330, 370].map((x, i) => (
                <line key={i} x1={x} y1={0} x2={x - 15} y2={160} stroke="rgba(100,150,220,0.3)" strokeWidth="1" />
            ))}
            {/* Coastline silhouette */}
            <path d="M0,120 Q60,110 120,115 Q180,120 240,110 Q300,100 360,112 Q380,116 400,110 L400,160 L0,160Z" fill="#0d1520" />
            {/* Debris */}
            <line x1="50" y1="130" x2="80" y2="118" stroke="#8B6914" strokeWidth="3" strokeLinecap="round" />
            <line x1="300" y1="125" x2="330" y2="115" stroke="#8B6914" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="140" y="128" width="20" height="12" rx="1" fill="#1e2a1e" transform="rotate(-20,140,128)" />
            {/* Label */}
            <text x="200" y="155" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="10" fontFamily="Inter,sans-serif">CYCLONE REENA – ODISHA</text>
        </svg>
    ),
}

/* ─── Know More Modal ────────────────────────────────────── */
function KnowMoreModal({ campaign, onClose }) {
    const [copied, setCopied] = useState(false)
    function handleBackdrop(e) {
        if (e.target === e.currentTarget) onClose()
    }
    function copyUpi() {
        navigator.clipboard.writeText(campaign.upiId)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }
    const d = campaign.details
    return (
        <div className="modal-backdrop" onClick={handleBackdrop}>
            <div className="modal km-modal">
                {/* Header */}
                <div className="modal-header">
                    <div>
                        <p className="modal-campaign-tag">{campaign.tag}</p>
                        <h2 className="modal-title">{campaign.title}</h2>
                    </div>
                    <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
                </div>

                {/* Scrollable body */}
                <div className="km-body">

                    {/* Disaster illustration banner */}
                    <div className="km-banner">
                        {BANNERS[campaign.img]}
                    </div>

                    {/* Meta pills */}
                    <div className="km-meta">
                        <span className="km-pill">📍 {d.location}</span>
                        <span className="km-pill">✅ Verified {d.verifiedOn}</span>
                        <span className="km-pill">🏛️ {d.organizer}</span>
                    </div>

                    {/* Overview */}
                    <div className="km-section">
                        <h4 className="km-section-title">Overview</h4>
                        <p className="km-text">{d.overview}</p>
                    </div>

                    {/* Impact */}
                    <div className="km-section">
                        <h4 className="km-section-title">Impact on Ground</h4>
                        <ul className="km-list">
                            {d.impact.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>

                    {/* How funds used */}
                    <div className="km-section">
                        <h4 className="km-section-title">How Funds Are Used</h4>
                        <ul className="km-list km-list-check">
                            {d.howFundsUsed.map((item, i) => <li key={i}>{item}</li>)}
                        </ul>
                    </div>

                    {/* Progress bar */}
                    <div className="km-section">
                        <div className="km-progress-label">
                            <span>{campaign.raised} raised</span>
                            <span>{campaign.percent}% of {campaign.goal}</span>
                        </div>
                        <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${campaign.percent}%` }} />
                        </div>
                    </div>

                    {/* UPI Payment */}
                    <div className="km-section km-upi-section">
                        <h4 className="km-section-title">Pay via UPI</h4>
                        <p className="km-text" style={{ fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                            Send your donation directly using any UPI app (GPay, PhonePe, Paytm, BHIM).
                        </p>
                        <div className="km-upi-row">
                            <span className="km-upi-id">{campaign.upiId}</span>
                            <button className="km-upi-copy" onClick={copyUpi}>
                                {copied ? '✓ Copied!' : 'Copy ID'}
                            </button>
                        </div>
                        <p className="km-upi-note">
                            🔒 Verified UPI handle — ensure the name shows <strong>FDRS Relief Fund</strong> before confirming.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function CampaignCard({ campaign, account, onOpenModal, onKnowMore }) {
    const isClosing = campaign.status === 'Closing Soon'
    return (
        <div className="card">
            {/* Disaster illustration banner */}
            <div className="card-img">
                {BANNERS[campaign.img]}
            </div>
            <div className="card-body">
                <div className="card-header">
                    <span className="card-tag">{campaign.tag}</span>
                    <span className={`card-status ${isClosing ? 'status-red' : 'status-green'}`}>
                        {campaign.status}
                    </span>
                </div>
                <h3 className="card-title">{campaign.title}</h3>
                <p className="card-desc">{campaign.desc}</p>
                <div className="card-progress">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${campaign.percent}%` }} />
                    </div>
                    <div className="progress-meta">
                        <span className="raised">{campaign.raised} raised</span>
                        <span className="percent">{campaign.percent}%</span>
                    </div>
                    <span className="goal">Goal: {campaign.goal}</span>
                </div>
                {/* Two-button row */}
                <div className="card-actions">
                    <button className="btn-know-more" onClick={() => onKnowMore(campaign)}>Know More</button>
                    <button
                        className="btn-donate"
                        onClick={() => {
                            if (!account) { alert('Please connect your MetaMask wallet first.'); return }
                            onOpenModal(campaign)
                        }}
                    >
                        Donate
                    </button>
                </div>
            </div>
        </div>
    )
}

function Campaigns({ account, onOpenModal, onKnowMore }) {
    return (
        <section id="campaigns" className="campaigns">
            <div className="section-header">
                <h2>Active Relief Campaigns</h2>
                <p>All campaigns are verified by the Ministry of Home Affairs and audited on-chain.</p>
            </div>
            <div className="cards-grid">
                {campaigns.map(c => (
                    <CampaignCard
                        key={c.id}
                        campaign={c}
                        account={account}
                        onOpenModal={onOpenModal}
                        onKnowMore={onKnowMore}
                    />
                ))}
            </div>
        </section>
    )
}

/* ─── Footer ─────────────────────────────────────────────── */
function Footer() {
    function handleSubscribe(e) {
        e.preventDefault()
        e.target.reset()
        alert('Thank you for subscribing!')
    }

    return (
        <footer className="footer">
            <div className="footer-inner">

                {/* Col 1 — Brand */}
                <div className="footer-col footer-brand-col">
                    <div className="footer-logo">
                        <span>🦅</span>
                        <span className="footer-logo-text">FDRS</span>
                    </div>
                    <p className="footer-tagline">
                        Falcons Disaster Response System — Empowering transparent,
                        blockchain-powered donations across India.
                    </p>
                </div>

                {/* Col 2 — Quick Links */}
                <div className="footer-col">
                    <h4 className="footer-heading">Quick Links</h4>
                    <ul className="footer-list">
                        <li><a href="#campaigns">Browse Campaigns</a></li>
                        <li><a href="#how">How It Works</a></li>
                        <li><a href="#about">About Us</a></li>
                    </ul>
                </div>

                {/* Col 3 — Resources */}
                <div className="footer-col">
                    <h4 className="footer-heading">Resources</h4>
                    <ul className="footer-list">
                        <li><a href="#faq">FAQ</a></li>
                        <li><a href="#terms">Terms of Service</a></li>
                        <li><a href="#privacy">Privacy Policy</a></li>
                    </ul>
                </div>

                {/* Col 4 — Connect */}
                <div className="footer-col">
                    <h4 className="footer-heading">Connect With Us</h4>
                    <div className="footer-socials">
                        <a href="#" className="social-icon" aria-label="Twitter">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.402 6.231H2.746l7.73-8.835L2.25 2.25h6.945l4.26 5.631 5.79-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                            </svg>
                        </a>
                        <a href="#" className="social-icon" aria-label="GitHub">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.021C22 6.484 17.522 2 12 2z" />
                            </svg>
                        </a>
                        <a href="#" className="social-icon" aria-label="LinkedIn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                            </svg>
                        </a>
                    </div>
                    <p className="footer-newsletter-label">Subscribe to our newsletter</p>
                    <form className="footer-newsletter" onSubmit={handleSubscribe}>
                        <input
                            type="email"
                            className="newsletter-input"
                            placeholder="Enter your email"
                            required
                        />
                        <button type="submit" className="newsletter-btn">Subscribe</button>
                    </form>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="footer-bottom">
                <p>© 2026 FDRS — Falcons Disaster Response System. All rights reserved.</p>
            </div>
        </footer>
    )
}


/* ─── How It Works ────────────────────────────────────── */
const howSteps = [
    {
        num: '1',
        title: 'Connect & Choose',
        desc: 'Connect your MetaMask wallet and browse the active disaster relief campaigns to find a cause you want to support.',
    },
    {
        num: '2',
        title: 'Donate Securely',
        desc: 'Enter your MATIC amount, confirm the transaction in MetaMask, and your donation is settled on-chain within seconds.',
    },
    {
        num: '3',
        title: 'Track Impact',
        desc: 'Monitor your contribution and watch the total raised update in real-time — every rupee is transparent and verifiable on-chain.',
    },
]

function HowItWorks() {
    return (
        <section id="how" className="how-section">
            <h2 className="how-heading">How It Works</h2>
            <div className="how-grid">
                {howSteps.map(s => (
                    <div key={s.num} className="how-step">
                        <div className="how-circle">{s.num}</div>
                        <h3 className="how-title">{s.title}</h3>
                        <p className="how-desc">{s.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}

/* ─── About Us ───────────────────────────────────────────── */
function AboutUs() {
    return (
        <section id="about" className="about-section">
            <div className="about-inner">
                <h2 className="about-title">About Us</h2>
                <p className="about-text">
                    Falcons Disaster Response System (FDRS) is dedicated to fostering positive change
                    across India. We combine blockchain technology with traditional payment methods
                    to create a transparent, secure, and accessible donation platform.
                </p>
                <p className="about-text">
                    Our mission is to connect compassionate donors with meaningful causes, ensuring
                    that every contribution makes a real difference in the lives of those who need it
                    most.
                </p>
            </div>
        </section>
    )
}

/* ─── App ────────────────────────────────────────────────── */
function App() {
    const [account, setAccount] = useState(null)
    const [walletError, setWalletError] = useState('')
    const [totalRaised, setTotalRaised] = useState(null)
    const [modalCampaign, setModalCampaign] = useState(null) // donate modal
    const [infoCampaign, setInfoCampaign] = useState(null) // know more modal

    // Fetch total raised on mount
    useEffect(() => {
        async function fetchTotal() {
            try {
                const total = await getTotalRaised()
                setTotalRaised(parseFloat(total).toFixed(4))
            } catch {
                setTotalRaised('N/A')
            }
        }
        fetchTotal()
    }, [])

    async function handleConnect() {
        setWalletError('')
        try {
            const addr = await connectWallet()
            setAccount(addr)
        } catch (err) {
            setWalletError(err.message)
        }
    }

    async function handleDonate(amountInMatic) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const signer = await provider.getSigner()
        const tx = await donate(signer, amountInMatic)
        // Refresh total raised
        const updated = await getTotalRaised()
        setTotalRaised(parseFloat(updated).toFixed(4))
        return tx
    }

    return (
        <>
            <Navbar account={account} onConnect={handleConnect} error={walletError} />
            <Hero totalRaised={totalRaised} />
            <Campaigns account={account} onOpenModal={setModalCampaign} onKnowMore={setInfoCampaign} />
            <HowItWorks />
            <AboutUs />
            <Footer />

            {/* Donation modal */}
            {modalCampaign && (
                <DonationModal
                    campaign={modalCampaign}
                    onClose={() => setModalCampaign(null)}
                    onDonate={handleDonate}
                />
            )}
            {/* Know More modal */}
            {infoCampaign && (
                <KnowMoreModal
                    campaign={infoCampaign}
                    onClose={() => setInfoCampaign(null)}
                />
            )}
        </>
    )
}

export default App
