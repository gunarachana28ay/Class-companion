import React, { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/api';

const Profile = () => {
    const [profile, setProfile] = useState({
        bio: '',
        location: '',
        birth_date: '',
        full_name: '',
        contact_details: '',
        subject: '',
        experience: null,
        rating: null,
        profile_picture: null,
        cv: null
    });

    useEffect(() => {
        async function fetchProfile() {
            try {
                const data = await getProfile();
                setProfile(data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        }
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (files) {
            setProfile({ ...profile, [name]: files[0] });
        } else {
            setProfile({ ...profile, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const updatedProfile = { ...profile };
        try {
            await updateProfile(updatedProfile);
            // Handle success/failure response
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Full Name:</label>
                <input type="text" name="full_name" value={profile.full_name} onChange={handleChange} />
            </div>
            <div>
                <label>Bio:</label>
                <textarea name="bio" value={profile.bio} onChange={handleChange} />
            </div>
            <div>
                <label>Location:</label>
                <input type="text" name="location" value={profile.location} onChange={handleChange} />
            </div>
            <div>
                <label>Birth Date:</label>
                <input type="date" name="birth_date" value={profile.birth_date} onChange={handleChange} />
            </div>
            <div>
                <label>Contact Details:</label>
                <textarea name="contact_details" value={profile.contact_details} onChange={handleChange} />
            </div>
            <div>
                <label>Subject:</label>
                <input type="text" name="subject" value={profile.subject} onChange={handleChange} />
            </div>
            <div>
                <label>Experience (years):</label>
                <input type="number" name="experience" value={profile.experience || ''} onChange={handleChange} />
            </div>
            <div>
                <label>Rating:</label>
                <input type="number" step="0.1" name="rating" value={profile.rating || ''} onChange={handleChange} />
            </div>
            <div>
                <label>Profile Picture:</label>
                <input type="file" name="profile_picture" onChange={handleChange} />
            </div>
            <div>
                <label>CV:</label>
                <input type="file" name="cv" onChange={handleChange} />
            </div>
            <button type="submit">Save changes</button>
        </form>
    );
};

export default Profile;

