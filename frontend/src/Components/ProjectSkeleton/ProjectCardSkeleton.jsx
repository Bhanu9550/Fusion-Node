import './ProjectCardSkeleton.css'

const ProjectCardSkeleton = () => {
    return (
        <div className="pcs-card">

            {/* ── Top Row ── */}
            <div className="pcs-top">
                <div className="pcs-shimmer pcs-badge" />
                <div className="pcs-top-actions">
                    <div className="pcs-shimmer pcs-like" />
                    <div className="pcs-shimmer pcs-more" />
                </div>
            </div>

            {/* ── Title + Tagline ── */}
            <div className="pcs-title-section">
                <div className="pcs-shimmer pcs-title" />
                <div className="pcs-shimmer pcs-tagline" />
                <div className="pcs-shimmer pcs-tagline pcs-tagline-short" />
            </div>

            {/* ── Owner Row ── */}
            <div className="pcs-owner-row">
                <div className="pcs-shimmer pcs-avatar" />
                <div className="pcs-shimmer pcs-owner-name" />
                <div className="pcs-shimmer pcs-posted-ago" />
            </div>

            {/* ── Skills ── */}
            <div className="pcs-skills-row">
                <div className="pcs-shimmer pcs-skill" />
                <div className="pcs-shimmer pcs-skill pcs-skill-md" />
                <div className="pcs-shimmer pcs-skill pcs-skill-sm" />
                <div className="pcs-shimmer pcs-skill" />
                <div className="pcs-shimmer pcs-skill pcs-skill-md" />
            </div>

            {/* ── Divider ── */}
            <div className="pcs-divider" />

            {/* ── Meta Grid ── */}
            <div className="pcs-meta-grid">
                {[...Array(4)].map((_, i) => (
                    <div className="pcs-meta-item" key={i}>
                        <div className="pcs-shimmer pcs-meta-icon" />
                        <div className="pcs-shimmer pcs-meta-label" />
                        <div className="pcs-shimmer pcs-meta-value" />
                    </div>
                ))}
            </div>

            {/* ── Buttons ── */}
            <div className="pcs-buttons">
                <div className="pcs-shimmer pcs-btn" />
                <div className="pcs-shimmer pcs-btn" />
            </div>

        </div>
    )
}

// ── Multiple Skeletons ──
export const ProjectCardSkeletonList = ({ count = 5 }) => {
    return (
        <>
            {[...Array(count)].map((_, i) => (
                <ProjectCardSkeleton key={i} />
            ))}
        </>
    )
}

export default ProjectCardSkeleton