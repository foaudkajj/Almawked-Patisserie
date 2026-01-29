document.addEventListener('DOMContentLoaded', () => {
    // Changed ID from menu-list to menu-wrapper in index.html, but let's select whatever exists
    const menuContainer = document.getElementById('menu-wrapper') || document.getElementById('menu-list');

    // Load data from global variable defined in data/products.js
    if (window.productsData) {
        renderContent(window.productsData, menuContainer);
    } else {
        console.error("No product data found. Please ensure data/products.js is loaded.");
        menuContainer.innerHTML = "<p style='text-align:center; color:red;'>Could not load menu data.</p>";
    }

    function renderContent(data, container) {
        // Clear container
        container.innerHTML = '';

        data.forEach(item => {
            renderItem(item, container, 1);
        });
    }

    // Recursive function to render categories or products
    function renderItem(item, container, level) {
        // Case 1: Category with subcategories
        if (item.subcategories) {
            const title = document.createElement(level === 1 ? 'h3' : 'h4');
            title.className = level === 1 ? 'category-title' : 'subcategory-title';
            title.textContent = item.title;
            container.appendChild(title);

            if (item.description) {
                const desc = document.createElement('div');
                desc.className = 'category-description';
                desc.textContent = item.description;
                container.appendChild(desc);
            }

            const nextContainer = document.createElement('div');
            nextContainer.className = 'category-group';
            container.appendChild(nextContainer);

            item.subcategories.forEach(sub => renderItem(sub, nextContainer, level + 1));
        
        // Case 2: Category with Items
        } else if (item.items) {
            const title = document.createElement(level === 1 ? 'h3' : 'h4');
            title.className = level === 1 ? 'category-title' : 'subcategory-title';
            title.textContent = item.title;
            container.appendChild(title);

            if (item.description) {
                const desc = document.createElement('div');
                desc.className = 'category-description';
                desc.textContent = item.description;
                container.appendChild(desc);
            }

            const list = document.createElement('ul');
            list.className = 'menu-list';
            container.appendChild(list);

            item.items.forEach(product => renderProduct(product, list));

        // Case 3: Just a list of products passed directly (legacy support or root array of products)
        } else if (item.name && item.price) {
            // Should properly be inside a grid, but if we found a product at root level:
            // Find or create a default list
            let list = container.querySelector('.menu-list:last-child');
            if (!list) {
                 list = document.createElement('ul');
                 list.className = 'menu-list';
                 container.appendChild(list);
            }
            renderProduct(item, list);
        }
    }

    function renderProduct(product, list) {
        // Generate ID on the fly if not present
        if (!product.id) {
            product.id = 'product-' + Math.floor(Math.random() * 1000000);
        }
        
        const listItem = document.createElement('li');
        listItem.className = 'menu-item';
        listItem.dataset.id = product.id;
        
        // Info Wrapper (Name + Description)
        const infoWrapper = document.createElement('div');
        infoWrapper.className = 'item-info';

        // Text Content
        const nameSpan = document.createElement('div');
        nameSpan.className = 'item-name';
        nameSpan.textContent = product.name;
        infoWrapper.appendChild(nameSpan);

        // Price Content
        const priceSpan = document.createElement('div');
        priceSpan.className = 'item-price';
        priceSpan.textContent = product.price ? product.price + ' ل.س' : '';
        infoWrapper.appendChild(priceSpan);

        // Description
        if (product.description) {
            const descSpan = document.createElement('div');
            descSpan.className = 'item-desc';
            descSpan.textContent = product.description;
            infoWrapper.appendChild(descSpan);
        }
        
        // Image Container
        const imgPreview = document.createElement('div');
        imgPreview.className = 'image-preview';
        
        if (product.image) {
            const img = document.createElement('img');
            img.src = product.image;
            img.alt = product.name;
            img.loading = 'lazy'; // Lazy load images
            // Add error handling for image 404
            img.onerror = () => {
                imgPreview.classList.add('no-image');
                imgPreview.innerHTML = '<span>لا توجد صورة</span>'; // No image text
                // Disable click on item if image fails
                listItem.onclick = null;
                listItem.style.cursor = 'default';
            };
            
            imgPreview.appendChild(img);

            // Enable click on the entire card to open modal
            listItem.style.cursor = 'pointer';
            listItem.onclick = () => {
                openModal(product.image, product.name);
            };
        } else {
            imgPreview.classList.add('no-image');
            imgPreview.innerHTML = '<span>لا توجد صورة</span>';
        }

        listItem.appendChild(infoWrapper);
        // listItem.appendChild(priceSpan); // Moved to infoWrapper
        listItem.appendChild(imgPreview);

        /* Removed Click Event for Mobile/Toggle */

        list.appendChild(listItem);
    }

    // Modal Logic
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image');
    const captionText = document.getElementById('caption');
    const span = document.getElementsByClassName('close-modal')[0];

    function openModal(src, alt) {
        modal.style.display = "block";
        modalImg.src = src;
        captionText.innerHTML = alt;
    }

    // Close when clicking (x)
    if (span) {
        span.onclick = function() { 
            modal.style.display = "none";
        }
    }

    // Close when clicking outside the image
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});
