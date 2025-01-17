document.addEventListener('DOMContentLoaded', () => {
    const loadingSpinner = document.getElementById('loading-spinner');
    const errorMessage = document.getElementById('error-message');
    const productList = document.getElementById('product-list');
    const cartCountElement = document.getElementById('cart-count');

    // Function to update the cart count on the page
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

        if (cartCountElement) {
            cartCountElement.textContent = cartCount;
        }

        localStorage.setItem('cartCount', cartCount); // Synchronize with cartCount for consistency
    }

    // Function to add an item to the cart
    function addToCart(productId, productDetails, quantity = 1) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingProductIndex = cart.findIndex(item => item.id === productId);

        if (existingProductIndex !== -1) {
            cart[existingProductIndex].quantity += quantity;
        } else {
            cart.push({ ...productDetails, id: productId, quantity });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount(); // Update cart count after adding a product
        alert(`${productDetails.name} has been added to your cart!`);
        updateTotalCost(); // Update total cost after adding a product
    }

    // Function to update the total cost
    function updateTotalCost() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalCost = cart.reduce((total, item) => total + item.price * item.quantity, 0);
        const totalCostElement = document.getElementById('total-cost');
        if (totalCostElement) {
            totalCostElement.textContent = `Total: $${totalCost.toFixed(2)}`;
        }
    }

    // Call the updateCartCount function on page load to set the initial cart count
    updateCartCount();
    updateTotalCost();

    // index.html specific script
    if (document.getElementById('featured-list')) {
        fetch('products.json')
            .then(response => response.json())
            .then(data => {
                const featuredList = document.getElementById('featured-list');
                data.products.slice(0, 4).forEach((product, index) => {
                    const productCard = document.createElement('div');
                    productCard.className = 'product-card';
                    productCard.innerHTML = `
                        <img src="${product.image}" alt="${product.name}">
                        <h2>${product.name}</h2>
                        <p>${product.shortdesc}</p>
                        <p class="price">$${product.price}</p>
                        <button class="view-details" data-id="${index}">View Details</button>
                        <button class="add-to-cart" data-id="${index}">Add to Cart</button>
                    `;
                    featuredList.appendChild(productCard);
                });

                document.querySelectorAll('.view-details').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const productId = e.target.getAttribute('data-id');
                        window.location.href = `details.html?id=${productId}`;
                    });
                });

                document.querySelectorAll('.add-to-cart').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const productId = e.target.getAttribute('data-id');
                        const product = data.products[productId];
                        addToCart(productId, product);
                    });
                });
            })
            .catch(error => console.error('Error loading featured products:', error));
    }

    // products.html specific script
    if (document.getElementById('product-list')) {
        // Display loading spinner
        loadingSpinner.style.display = 'block';

        fetch('products.json')
            .then(response => response.json())
            .then(data => {
                // Hide loading spinner
                loadingSpinner.style.display = 'none';

                if (data.products && data.products.length > 0) {
                    data.products.forEach((product, index) => {
                        const productCard = document.createElement('div');
                        productCard.className = 'product-card';
                        productCard.innerHTML = `
                            <img src="${product.image}" alt="${product.name}">
                            <h2>${product.name}</h2>
                            <p>${product.shortdesc}</p>
                            <p class="price">$${product.price}</p>
                            <a href="details.html?id=${index}" class="view-details">View Details</a>
                            <button class="add-to-cart" data-id="${index}">Add to Cart</button>
                        `;
                        productList.appendChild(productCard);
                    });

                    // Attach event listeners for "Add to Cart" buttons
                    document.querySelectorAll('.add-to-cart').forEach(button => {
                        button.addEventListener('click', (e) => {
                            const productId = e.target.getAttribute('data-id');
                            const product = data.products[productId];
                            addToCart(productId, product);
                        });
                    });
                } else {
                    productList.innerHTML = '<p>No products available at the moment.</p>';
                }
            })
            .catch(error => {
                // Hide loading spinner and show error message
                loadingSpinner.style.display = 'none';
                errorMessage.style.display = 'block';
                console.error('Error loading products:', error);
            });
    }

    // details.html specific script
    if (document.querySelector('.product-details')) {
        const params = new URLSearchParams(window.location.search);
        const productId = params.get('id');

        fetch('products.json')
            .then(response => response.json())
            .then(data => {
                const product = data.products[productId];
                if (product) {
                    document.querySelector('.product-details img').src = product.image;
                    document.querySelector('.product-details img').alt = product.name;
                    document.querySelector('.details h1').textContent = product.name;
                    document.querySelector('.details p.description').textContent = product.description;
                    document.querySelector('.details p.price').textContent = `$${product.price}`;

                    const addToCartButton = document.querySelector('.details button');
                    addToCartButton.addEventListener('click', () => {
                        const quantity = parseInt(document.querySelector('#quantity').value, 10) || 1;
                        addToCart(productId, product, quantity);
                    });
                } else {
                    document.querySelector('.product-details').innerHTML = '<p>Product not found.</p>';
                }
            })
            .catch(error => console.error('Error loading product details:', error));
    }

    // cart.html specific script
    if (document.getElementById('cart-list')) {
        function updateCartUI() {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const cartList = document.getElementById('cart-list');
            const totalPriceElement = document.getElementById('total-price');
            const checkoutButton = document.getElementById('checkout-btn');
            let totalPrice = 0;

            cartList.innerHTML = '';

            if (cart.length > 0) {
                cart.forEach((item, index) => {
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item';
                    cartItem.innerHTML = `
                        <img src="${item.image}" alt="${item.name}">
                        <div class="item-details">
                            <h3>${item.name}</h3>
                            <p>Price: $${item.price}</p>
                            <input type="number" class="quantity" value="${item.quantity}" data-index="${index}" min="1">
                        </div>
                        <button class="remove-item" data-index="${index}">Remove</button>
                    `;
                    cartList.appendChild(cartItem);
                    totalPrice += item.price * item.quantity;
                });

                totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
                checkoutButton.disabled = false;
            } else {
                cartList.innerHTML = '<p>Your cart is empty.</p>';
                totalPriceElement.textContent = `$0.00`;
                checkoutButton.disabled = true;
            }
        }

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item')) {
                const index = e.target.getAttribute('data-index');
                const cart = JSON.parse(localStorage.getItem('cart')) || [];
                cart.splice(index, 1);
                localStorage.setItem('cart', JSON.stringify(cart));
                updateCartUI();
                updateCartCount();
                updateTotalCost(); // Update total cost after removing a product
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('quantity')) {
                const index = e.target.getAttribute('data-index');
                const newQuantity = parseInt(e.target.value);
                const cart = JSON.parse(localStorage.getItem('cart')) || [];

                if (newQuantity > 0) {
                    cart[index].quantity = newQuantity;
                    localStorage.setItem('cart', JSON.stringify(cart));
                    updateCartUI();
                    updateCartCount();
                    updateTotalCost(); // Update total cost after changing quantity
                }
            }
        });

        document.getElementById('checkout-btn').addEventListener('click', () => {
            window.location.href = 'checkout.html';
        });

        updateCartUI();
    }

    // checkout.html specific script
    if (document.getElementById('checkout-form')) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalCost = cart.reduce((total, item) => total + item.price * item.quantity, 0);

        const totalCostElement = document.getElementById('total-cost');
        if (totalCostElement) {
            totalCostElement.textContent = `Total: $${totalCost.toFixed(2)}`;
        }

        document.getElementById('checkout-form').addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const address = document.getElementById('address').value;
            const paymentMethod = document.getElementById('payment-method').value;

            if (!name || !email || !address || !paymentMethod) {
                alert('Please fill out all fields to complete your purchase.');
                return;
            }

            alert(`Thank you for your purchase, ${name}!\n` +
                `A confirmation email will be sent to ${email}.\n` +
                `Shipping to: ${address}\n` +
                `Payment Method: ${paymentMethod}\n` +
                `Total Cost: $${totalCost.toFixed(2)}`);

            localStorage.removeItem('cart');
            localStorage.setItem('cartCount', 0);
            updateCartCount(); // Assuming updateCartCount is a function that updates the cart display

            window.location.href = 'index.html';
        });
    }
});
