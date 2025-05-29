// Initialize Alpine.js component
document.addEventListener('alpine:init', () => {
    Alpine.data('app', () => ({
        response: '',
        loading: true,

        async init() {
            console.log('Initializing app...');
            try {
                const response = await fetch('/api/words');
                const data = await response.json();
                
                console.log(data);

                // Format the response for display
                this.response = data.response.map(word => 
                    `<div class="mb-12 text-left">
                        <div class="flex items-baseline gap-2 mb-3">
                            <h2 class="text-3xl font-bold">${word.word}</h2>
                            <span class="text-gray-400 text-sm">/ ${word.class}</span>
                        </div>
                        <div class="ml-4 mb-4">
                            ${word.definitions.map((def, index) => 
                                `<p class="mb-2">
                                    <span class="text-gray-400">${index + 1}.</span>
                                    <span class="italic">${def}</span>
                                </p>`
                            ).join('')}
                        </div>
                        <div class="ml-4">
                            <h3 class="text-lg font-semibold mb-2 text-gray-300">Example Sentences:</h3>
                            <ul class="list-disc list-inside space-y-2">
                                ${word.sentences.map(sentence => 
                                    `<li class="text-gray-200">${sentence}</li>`
                                ).join('')}
                            </ul>
                        </div>
                    </div>`
                ).join('');
            } catch (error) {
                console.error('Error fetching daily insight:', error);
                this.response = 'Unable to fetch today\'s insight. Please try again later.';
            }
            this.loading = false;
        }
    }));
}); 