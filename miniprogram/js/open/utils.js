function loadImage(index, imgSrc) {
    return new Promise((resolve, reject) => {
        const img = wx.createImage();
        img.onload = () => {
            resolve({
                index: index,
                image: img
            });
        }
        img.onerror = (err) => {
            reject(err)
        }
        img.src = imgSrc;
    });
}

module.exports = {
    loadImage: loadImage
}