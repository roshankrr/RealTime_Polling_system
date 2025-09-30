import Poll from '../models/pollModel.js';

const gethistory = async (PollHistory) => {
  try {
    const history = await Poll.find().sort({ createdAt: -1 });
    return history;
  } catch (error) {
    console.error('Error fetching poll history:', error);
  }
};

async function savePollToHistory(pollData) {
    try {
        if (!pollData || !pollData.question) {
            console.log('No valid poll data to save');
            return;
        }

        // Debug: Log the actual structure of pollData.options
        console.log('Poll options structure:', JSON.stringify(pollData.options, null, 2));

        // Handle the actual option structure based on the error message
        const formattedOptions = pollData.options.map(option => {
            let optionText = '';
            let votes = 0;

            // Handle different possible structures
            if (typeof option === 'string') {
                optionText = option;
                votes = 0;
            } else if (typeof option === 'object') {
                // Based on error: { value: 'option 1', isCorrect: false, votes: 1 }
                optionText = option.value || option.text || option.optionText || 'Unknown option';
                votes = option.votes || 0;
            }

            return {
                optionText: String(optionText), // Ensure it's a string
                votes: Number(votes) // Ensure it's a number
            };
        });

        console.log('Formatted options for saving:', JSON.stringify(formattedOptions, null, 2));

        const pollToSave = new Poll({
            question: pollData.question,
            options: formattedOptions,
            duration: pollData.duration
        });

        const savedPoll = await pollToSave.save();
        console.log('Poll saved to history:', savedPoll._id);
        console.log('Saved poll data:', {
            question: savedPoll.question,
            totalVotes: savedPoll.options.reduce((sum, opt) => sum + opt.votes, 0),
            options: savedPoll.options
        });
        return savedPoll;
    } catch (error) {
        console.error('Error saving poll to database:', error);
        throw error;
    }
}

export { gethistory, savePollToHistory };