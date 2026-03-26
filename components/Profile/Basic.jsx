import React, { useState } from 'react'
import styles from '../../styles/Profile/Basic.module.css'
import Image from 'next/image'
import { useRouter } from 'next/router'
import CreateIcon from '@mui/icons-material/Create';
import { useDispatch, useSelector } from 'react-redux';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { logout } from '@/redux/userSlice';
import CallIcon from '@mui/icons-material/Call';
import PlaceIcon from '@mui/icons-material/Place';
import { calculateDistance } from '@/utility/helper';
import FindNearMe from '../Utility/FindNearMe';
import { showSnackBar } from '@/redux/notistackSlice';
import DirectionsIcon from '@mui/icons-material/Directions';

import axios from 'axios';
import { Vazirmatn } from '@next/font/google';
import ConfirmationModal from '../Utility/ConfirmationModal';
import { finishLoading, startLoading } from '@/redux/stateSlice';
import VerificationAlertBox from './VerificationAlertBox';
import ProfileCompletion from './ProfileCompletion';
const Basic = ({ profile }) => {
    const router = useRouter()
    const dispatch = useDispatch()
    const userInfo = useSelector(state => state.user.userInfo)
    const location = useSelector(state => state.user.location)
    const [openModal, setOpenModal] = useState(false)


    const clearUserInfo = () => {
        dispatch(logout())
        router.push('/')
    }
    const headers = { Authorization: `Bearer ${userInfo?.token}` }

    const bookNow = async (bookingInfo) => {

        try {
            dispatch(startLoading())
            // Redirect to login if user is not logged in
            if (!userInfo) {
                dispatch(showSnackBar({
                    message: "First Login To Book Appointment",

                }))
                router.push(`/login?redirect=${doctorId}`);
                return;
            }

            // Make API call to create booking
            const { data } = await axios.post('/api/booking', {
                doctorId: profile._id,
                date: new Date(),
                startTime: bookingInfo.startTime,
                endTime: bookingInfo.endTime,
                symptoms: bookingInfo.note,
                consultationFee: profile.consultationFee
            }, {
                headers
            });
            dispatch(finishLoading())
            // Show success message
            dispatch(showSnackBar({ message: `Booking successful! Serial: ${data.serial}` }));

            // Optional: redirect to booking details page
            router.push(`/booking/${data._id}`);
        } catch (error) {
            dispatch(finishLoading())
            console.error(error);
            dispatch(
                showSnackBar({
                    message: error.response?.data?.error || 'Failed to book appointment',
                })
            );
        }
    };

    const initiallzeBooking = () => {
        if (userInfo) {
            setOpenModal(true)
        } else {
            dispatch(showSnackBar(
                {
                    message: "First Login For Booking",
                    option: {
                        variant: "info"
                    }
                }
            ))
            router.push(`/login?redirectTo=profile/${profile._id}`)
        }

    }

    return (
        <div className={styles.wrapper}>
            {openModal && <ConfirmationModal setOpenModal={setOpenModal} bookNow={bookNow} />}
            <div className={styles.left}>
                <div className={styles.pic}>
                    <Image src={profile.image} width={200} height={260} alt="" unoptimized />
                </div>
                {/* {profile.image} */}
            </div>
            <div className={styles.right}>
                {(userInfo?.id == profile._id) || (userInfo?.role == "admin") && <div className={styles.profile__completion}>
                    <ProfileCompletion user={profile} />

                </div>}
                <div className={styles.name}>{
                    profile.fullName || profile.firstName}{" "}{profile.lastName}

                </div>

                {(userInfo?.id && profile._id == userInfo?.id) || userInfo?.role == "admin" && !profile.isVerified && <VerificationAlertBox profile={profile} />}
                {profile.role == "doctor" && (<>   <div className={styles.education}>
                    {profile.speciality}
                </div>
                    {profile.department && <div className={styles.department}>
                        Dermatologist
                    </div>}

                    <div className={styles.flex}>
                        <div className={styles.item}>
                            <div>Total Experiance</div>
                            <b>{profile.totalExperience} Years</b>
                        </div>
                        <div className={styles.item}>
                            <div>BMDC Number
                            </div>
                            <b>
                                {profile.bmdcNumber}
                            </b>
                        </div>
                        <div className={styles.item}>
                            <div>Total Rating</div>
                            <b>0.0
                                (000)</b>
                        </div>
                        <div className={styles.item}>
                            <div>Working In</div>
                            <b>
                                {profile.workingIn || "..............."}
                            </b>
                        </div>
                    </div>
                    <div className={styles.book}>
                        <div className={styles.left}>
                            <div>Consulation Fee</div>
                            <div className={styles.fee}>
                                BDT {profile.consultationFee || 500}
                            </div>
                        </div>

                        {!(router.query.slug == userInfo?.id) && <div className={styles.btn} onClick={() => {
                            initiallzeBooking()
                        }}>
                            Book Now
                        </div>}
                    </div>
                    {profile?.location && location?.lat && <div className={styles.distance}>
                        In {" "}{calculateDistance([location.lat, location.lng], profile.location.coordinates).toFixed(2)} {" "}KM
                    </div>}</>)}
                <div className={styles.flex} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    {!(router.query.slug == userInfo?.id) && < div className={styles.icon}>
                        <FindNearMe text={"Locate"} redirect={false} />
                    </div>}

                    {/* <a href={`tel:+88${profile.phoneNumber}`}>
                        <div className={styles.icon}>
                            <CallIcon /> Call</div>
                    </a> */}


                    {(router.query.slug == userInfo?.id || userInfo?.role == "admin") &&
                        <div className={styles.icon} onClick={() => router.push(`/profile/update/${router.query.slug}`)}> <CreateIcon /> Update</div>
                    }
                    {router.query.slug == userInfo?.id && <div className={styles.icon} onClick={() => clearUserInfo()} style={{ background: "rgb(255,0,0,0.1", color: "red" }}>
                        <ExitToAppIcon /> Logout</div>
                    }
                </div>
            </div>
        </div >
    )
}

export default Basic