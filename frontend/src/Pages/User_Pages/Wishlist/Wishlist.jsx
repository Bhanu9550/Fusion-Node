import { useContext, useEffect, useState } from 'react'
import SideNavbar from '../../../Components/SideNavbar/SideNavbar'
import TopNavbar from '../../../Components/TopNavbar/TopNavbar'
import BottomNavbar from '../../../Components/BottomNavbar/BottomNavbar'
import ProjectCard from '../../../Components/ProjectCard/ProjectCard'
import { ProjectCardSkeletonList } from '../../../Components/ProjectSkeleton/ProjectCardSkeleton'
import WishlistContext from '../../../Context/WishlistContext'
import api from '../../../Configure/axiosConfigure'
import JoinRequestModel from '../../../Components/JoinRequestModal/JoinRequestModel'
import './Wishlist.css'
import { Link } from 'react-router-dom'

const Wishlist = () => {

    const { wishlistIds } = useContext(WishlistContext)
    const [projects, setProjects] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedProject, setSelectedProject] = useState(null)

    useEffect(() => {
        setIsLoading(true)
        api.get('/users/me/wishlist')
            .then(res => setProjects(res.data.wishlist || []))
            .catch(err => console.error(err))
            .finally(() => setIsLoading(false))
    }, [wishlistIds.size])

    return (
        <section className="page-wrapper">
            <SideNavbar />

            <div className="right-dashboard">
                <TopNavbar />

                <div className="wl-page">
                    <div className="wl-header">
                        <div>
                            <h1 className="wl-title">❤️ Wishlist</h1>
                            <p className="wl-subtitle">Projects you've saved for later.</p>
                        </div>
                        <div>
                            <Link className='back-button' to="/projects">Back</Link>
                        </div>

                    </div>

                    <div className="wl-list">
                        {isLoading ? (
                            <ProjectCardSkeletonList />
                        ) : projects.length === 0 ? (
                            <div className="wl-empty">You haven't saved any projects yet. Tap the heart on a project card to save it.</div>
                        ) : (
                            projects.map(project => (
                                <ProjectCard key={project._id} project={project} onReviewClick={setSelectedProject} />
                            ))
                        )}
                    </div>
                </div>
            </div>

            <BottomNavbar />

            {selectedProject && (
                <JoinRequestModel
                    key={selectedProject._id}
                    project={selectedProject}
                    onClose={() => setSelectedProject(null)}
                />
            )}
        </section>
    )
}

export default Wishlist
