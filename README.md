# postcards-from-my-jungle

### Strategies for Training the Models

The dataset was selected after balancing dataset size, label structure, and GPU limitations. My goal was to find a dataset large enough to provide animal category diversity but small enough to run on Google Colab’s free GPU tier.

I initially experimented with a [699MB animal dataset](https://huggingface.co/datasets/mertcobanov/animals). However, the loading time reached 45 minutes and approached GPU memory limits. Therefore, I switched to a smaller [363MB dataset](https://huggingface.co/datasets/licmajster/Animals_Recognition), which reduced loading time to approximately 7 minutes while maintaining sufficient variation for training.

I also examined the types of images included. Some datasets contained AI-generated images (like fishes cycling). To avoid this, I selected a dataset with visually natural images, even though illustrations is fine if the animals looked realistic.

To align with the lo-fi visual direction, I used a 64×64-pixel resolution and trained the full dataset for 10 epochs. Although I tried increasing training to 20 epochs to improve clarity, it exceeded the Colab GPU limit each time. Therefore, I kept 10 epochs as the final setting.

### How I Generated the Fictional Beasts’ Images, Sounds, and Language

The images were generated using a diffusion model trained on the selected animal dataset. To stay within GPU limits, I generated the images in batches of 10 at a time, repeating the process 5 times. The model progressively reversed noise during sampling to produce images based on the training data.

The sounds were generated using Stable Audio Open. Each prompt included the specific animal type, environmental atmosphere (e.g., jungle ambience), and the duration.

To create the fictional “animal language,” I used the OpenAI GPT-4.1 response API with a temperature of 1.5. The model generated 16 short phrases composed only of syllables, without English vocabulary or punctuation. The prompt also incorporated animal sound prompt to guide tone and mood. The output was validated as a JSON array and integrated into the website.

### How the Quality of the Images and Sounds Could Be Improved

Image quality could be improved by increasing dataset size, extending training epochs, raising resolution, increasing diffusion sampling steps, or expanding model capacity.

Sound quality could also be enhanced through visual conditioning or training on higher-fidelity curated datasets. 

However, these improvements would require more GPU memory, longer training time, and greater computational resources.
