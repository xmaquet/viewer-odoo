document.addEventListener('DOMContentLoaded', function () {
    const stage = new Konva.Stage({
        container: 'tshirt-stage',
        width: 650,
        height: 650,
    });

    const layer = new Konva.Layer();
    stage.add(layer);

    let tshirtImage = new Image();
    let logoImage = null;
    let logoPosition = { x: 50, y: 50 };
    let logoWidth = 100;
    let logoHeight = 100;
    let logoRotation = 0;
    let tr = null;

    function updateTshirtImage() {
        const activeCarouselItem = parent.document.querySelector('.carousel-item.active img');
        if (activeCarouselItem) {
            tshirtImage.src = activeCarouselItem.src;
            tshirtImage.onload = function () {
                layer.clear();
                const tshirt = new Konva.Image({
                    image: tshirtImage,
                    width: 650,
                    height: 650,
                });
                layer.add(tshirt);
                if (logoImage) {
                    const logo = new Konva.Image({
                        image: logoImage,
                        x: logoPosition.x,
                        y: logoPosition.y,
                        width: logoWidth,
                        height: logoHeight,
                        draggable: true,
                        rotation: logoRotation,
                    });
                    logo.on('dragend', function () {
                        logoPosition = {
                            x: logo.x(),
                            y: logo.y(),
                        };
                    });
                    logo.on('transformend', function () {
                        const scaleX = logo.scaleX();
                        const scaleY = logo.scaleY();
                        logoWidth = logo.width() * scaleX;
                        logoHeight = logo.height() * scaleY;
                        logoRotation = logo.rotation();
                    });
                    logo.on('click tap', function (e) {
                        e.cancelBubble = true;
                        console.log('Logo clicked');
                        if (!tr) {
                            addAnchor(logo, layer);
                        }
                    });
                    layer.add(logo);
                    layer.draw();
                }
                layer.draw();
            };
        }
    }

    function addAnchor(logo, layer) {
        tr = new Konva.Transformer({
            nodes: [logo],
            enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right', 'top-center', 'bottom-center', 'left-center', 'right-center'],
            boundBoxFunc: (oldBox, newBox) => {
                if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                }
                return newBox;
            },
            rotateEnabled: true,
        });
        layer.add(tr);
        layer.draw();
    }

    const logoUploadLabel = document.querySelector('label[for="logo-upload"]');
    const logoUpload = document.getElementById('logo-upload');
    if (logoUploadLabel && logoUpload) {
        logoUploadLabel.addEventListener('click', function () {
            logoUpload.click();
        });

        logoUpload.addEventListener('change', function (event) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.src = e.target.result;
                img.onload = function () {
                    logoImage = img;
                    const aspectRatio = img.width / img.height;
                    logoWidth = 100;
                    logoHeight = logoWidth / aspectRatio;
                    updateTshirtImage();

                    const fileSizeInKB = (file.size / 1024).toFixed(2);
                    const estimatedDPI = 72;
                    const widthInInches = img.width / estimatedDPI;
                    const heightInInches = img.height / estimatedDPI;
                    document.getElementById('image-details').innerText = `Dimensions: ${img.width}x${img.height}px, Poids: ${fileSizeInKB} Ko, Définition estimée: ${estimatedDPI} DPI (Largeur: ${widthInInches.toFixed(2)} pouces, Hauteur: ${heightInInches.toFixed(2)} pouces)`;
                };
            };
            reader.readAsDataURL(file);
        });
    }

    const observer = new MutationObserver(updateTshirtImage);
    const carousel = parent.document.querySelector('.carousel');
    if (carousel) {
        observer.observe(carousel, {
            childList: true,
            subtree: true,
            attributes: true,
        });
    }

    stage.on('click tap', function (e) {
        if (tr && !e.target.hasName('Image')) {
            console.log('Clicked outside logo');
            tr.destroy();
            tr = null;
            layer.draw();
        }
    });

    const intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                updateTshirtImage();
            }
        });
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    });

    intersectionObserver.observe(document.getElementById('tshirt-stage'));

    window.addEventListener('scroll', updateTshirtImage);

    updateTshirtImage();
});
