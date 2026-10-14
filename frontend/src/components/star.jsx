import React, { useState } from 'react';
import styled from 'styled-components';
import useAxios from '../api/axiosConfig';
import { toast } from 'react-toastify';

const StarContainer = styled.div`
  display: flex;
`;

const Star = styled.div`
  width: 24px;
  height: 24px;
  clip-path: polygon(
    50% 0%,
    61% 35%,
    98% 35%,
    68% 57%,
    79% 91%,
    50% 70%,
    21% 91%,
    32% 57%,
    2% 35%,
    39% 35%
  );
  background: ${props => (props.filled || props.halfFilled ? 'gold' : 'lightgray')};
  position: relative;
`;

const StarHalf = styled(Star)`
  &:before {
    content: '';
    width: 50%;
    height: 100%;
    background: gold;
    position: absolute;
    top: 0;
    left: 0;
  }
`;

export const starRatingMode = {
  VIEWONLY: 0,
  EIDTABLE: 1
}

const StarRating = ({ rating, mode = starRatingMode.VIEWONLY, tutorId }) => {
  if (mode === starRatingMode.EIDTABLE) {
    if (rating) {
      return <StarRatingViewonly rating={rating} />
    } else {
      return <StarRatingEditable rating={rating} tutorId={tutorId} />
    }
  } else {
    return <StarRatingViewonly rating={rating} />
  }
};

const StarRatingViewonly = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;

  return (
    <StarContainer>
      {[...Array(fullStars)].map((_, index) => (
        <Star key={index} filled />
      ))}
      {halfStar === 1 && <StarHalf />}
      {[...Array(emptyStars)].map((_, index) => (
        <Star key={index + fullStars + 1} />
      ))}
    </StarContainer>
  );
}

const StarRatingEditable = ({ tutorId }) => {
  const [hoverIdx, setHoverIdx] = useState(null);
  const [finalizedRating, setFinalizedRating] = useState(null);
  const axiosInstance = useAxios();

  const handleRating = (rating) => {
    (async () => {
      try {
        await axiosInstance.post(`/rate_tutor`, {
          tutor_id: tutorId,
          rating: rating
        });
        setFinalizedRating(rating);
        toast.success('Your rating is saved.');
      } catch (e) {
        console.log(e)
      }
    })()
  }

  return (
    <StarContainer>
      {Array(5).fill(null).map((_, idx) => (
        <Star key={idx} onMouseEnter={() => { setHoverIdx(idx) }} onMouseLeave={() => { setHoverIdx(null) }} onClick={() => handleRating(idx + 1)} filled={idx <= (finalizedRating - 1)} />
      ))}
    </StarContainer>
  );
}

export default StarRating;
