
// 6. Accordion Functionality (Branches Section)
const accordionHeaders = document.querySelectorAll('.accordion-header');

accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
        const accordionItem = header.parentElement;
        const accordionContent = header.nextElementSibling;
        const isActive = accordionItem.classList.contains('active');

        // Close all other accordion items
        document.querySelectorAll('.accordion-item').forEach(item => {
            item.classList.remove('active');
            item.querySelector('.accordion-content').style.maxHeight = null;
        });

        // If the clicked item wasn't active, open it
        if (!isActive) {
            accordionItem.classList.add('active');
            accordionContent.style.maxHeight = accordionContent.scrollHeight + "px";
        }
    });
});
