const getBatchStatus = (expiryDate, stock) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return 'Expired';
    if (diffDays <= 30) return 'Expiring Soon'; // Less than 30 days
    if (stock <= 10) return 'Low Stock'; // Stock threshold
    return 'Ok';
};

module.exports = { getBatchStatus };
