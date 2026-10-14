const shortDate = (fullDate) => {
    const date = new Date(fullDate);

    const options = { day: '2-digit', month: 'short' };
    return date.toLocaleDateString('en-US', options);
}

export { shortDate }