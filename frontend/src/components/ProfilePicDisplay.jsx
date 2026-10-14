const ProfilePicDisplay = ({ previewUrl }) => {
    return (
        <div className="overflow-hidden	rounded-full">
            <img className="object-cover object-center" src={previewUrl} alt="Rounded avatar" />
        </div>
    )
}

export default ProfilePicDisplay