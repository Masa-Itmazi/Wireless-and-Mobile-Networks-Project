document.addEventListener('DOMContentLoaded', function() {
    // Function to calculate Sampler, Quantizer, Source Encoder, Channel Encoder, and Interleaver
    function calculateParameters() {
        // Fetch input values
        var bandwidth = parseFloat(document.getElementById('bandwidth').value.trim());
        var numberOfBits = parseInt(document.getElementById('number-of-bits').value.trim());
        var compressionRate = parseFloat(document.getElementById('compression-rate').value.trim());
        var channelEncoderRate = parseFloat(document.getElementById('channel-encoder-rate').value.trim());
        var interleaverBits = parseFloat(document.getElementById('interleaver-bits').value.trim());

        // Perform calculations
        var sampler = 2 * bandwidth;
        var quantizer = numberOfBits * sampler;
        var sourceEncoder = compressionRate * quantizer;
        var channelEncoder = channelEncoderRate * sourceEncoder;
        var interleaver = interleaverBits * channelEncoder;

        // Display results
        var resultElement = document.getElementById('sampler-quantizer-result'); // Assuming you want to display in this element
        if (resultElement) {
            resultElement.innerHTML = `
                <h3>Calculated Parameters:</h3>
                <p>Sampler: ${sampler.toFixed(2)}</p>
                <p>Quantizer: ${quantizer.toFixed(2)}</p>
                <p>Source Encoder: ${sourceEncoder.toFixed(2)}</p>
                <p>Channel Encoder: ${channelEncoder.toFixed(2)}</p>
                <p>Interleaver: ${interleaver.toFixed(2)}</p>
            `;
        } else {
            console.error('Element with ID "sampler-quantizer-result" not found.');
        }
    }

    // Attach calculateParameters function to the Calculate button click event
    var calculateButton = document.querySelector('#calculator-form button[type="button"]');
    if (calculateButton) {
        calculateButton.addEventListener('click', calculateParameters);
    } else {
        console.error('Calculate button not found.');
    }

    // Function to calculate OFDM Parameters
    function calculateOFDMParameters() {
        // Fetch input values
        var bw = parseFloat(document.getElementById('ofdm-bandwidth').value.trim());
        var df = parseFloat(document.getElementById('subcarrier-spacing').value.trim());
        var N = parseInt(document.getElementById('number-of-symbols').value.trim());
        var T_rb = parseFloat(document.getElementById('resource-block-duration').value.trim()) / 1000; // Convert ms to s;
        var B = parseInt(document.getElementById('modulated-bits').value.trim());
        var n = parseInt(document.getElementById('number-of-parallel-blocks').value.trim());

        // Perform calculations
        var bitsPerResourceElement =  Math.log2(B); // assuming 1024-QAM as per your example
        var bitsPerOFDMSymbol = (bw/df) * bitsPerResourceElement;
        var bitsPerResourceBlock = bitsPerOFDMSymbol * N; // convert ms to s
        var maxTransmissionRate =( n * bitsPerResourceBlock)/T_rb;

        // Display results
        var resultElement = document.getElementById('ofdm-result'); // Assuming you want to display in this element
        if (resultElement) {
            resultElement.innerHTML = `
                <h3>OFDM Calculated Parameters:</h3>
                <p>Bits Per Resource Element: ${bitsPerResourceElement.toFixed(2)}</p>
                <p>Bits Per OFDM Symbol: ${bitsPerOFDMSymbol.toFixed(2)}</p>
                <p>Bits Per Resource Block: ${bitsPerResourceBlock.toFixed(2)}</p>
                <p>Max Transmission Rate: ${maxTransmissionRate.toFixed(2)}</p>
            `;
        } else {
            console.error('Element with ID "ofdm-result" not found.');
        }
    }

    // Attach calculateOFDMParameters function to the Calculate button click event
    var calculateOFDMButton = document.querySelector('section.card:nth-of-type(2) button[type="button"]');
    if (calculateOFDMButton) {
        calculateOFDMButton.addEventListener('click', calculateOFDMParameters);
    } else {
        console.error('OFDM Calculate button not found.');
    }
});
