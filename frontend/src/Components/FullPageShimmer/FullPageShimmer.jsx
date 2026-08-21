import './FullPageShimmer.css'

const FullPageShimmer = () => {
    return (
        <>
            <div className="shimmer-overlay" id="shimmerOverlay">
                <div className="shimmer-logo-wrap">
                    <img src="FusionNode_Logo.png" alt="FN Logo" className="shimmer-logo" />
                </div>
            </div>
        </>
    )
}

export default FullPageShimmer