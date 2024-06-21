// Define functions globally

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
    var bitsPerResourceBlock = bitsPerOFDMSymbol * N;
    var maxTransmissionRate = (n * bitsPerResourceBlock) / T_rb;

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

// Function to calculate Throughput
function calculateThroughput() {
    var selection = document.getElementById('csma-selection').value;
    var g_fps = parseFloat(document.getElementById('g').value.trim());
    var bw_bps = parseInt(document.getElementById('data-transmission-bandwidth').value.trim());
    var frameSize_bits = parseFloat(document.getElementById('frame-size').value.trim());
    var T_microsec = parseFloat(document.getElementById('T').value.trim());


    // Convert units
    var g_kfps = g_fps / 1000; // frames per second to kiloframes per second
    var bw_mbps = bw_bps / 1e6; // bits per second to megabits per second
    var frameSize_kbit = frameSize_bits / 1000; // bits to kilobits
    var T_sec = T_microsec / 1e6; // microseconds to seconds

    // Calculate Tb, Tframe, G, alpha
    var Tb = 1 / bw_mbps; // inverse of bandwidth in Mbps
    var Tframe = frameSize_kbit * Tb; // frame size in kbit * Tb
    var G = g_kfps * Tframe; // g in kiloframes * Tframe
    var alpha = T_sec / Tframe; // T in seconds / Tframe

    var S_th;

    switch (selection) {
        case 'unslotted-nonpersistent':
            S_th = G * Math.exp(-2 * alpha * T_sec) * (G * (1 + 2 * alpha) + Math.exp(-alpha * G));
            break;
        case 'slotted-nonpersistent':
            S_th = alpha * G * Math.exp(-2 * alpha * T_sec) * (1 - Math.exp(-alpha * G) + alpha);
            break;
        case 'unslotted-1-persistent':
            S_th = G * (1 + G + alpha * G * (1 + G + alpha * G * 2)) * Math.exp(-G * (1 + 2 * alpha)) - (1 - Math.exp(-alpha * G)) + (1 + alpha * G) * Math.exp(-G * (1 + alpha));
            break;
        case 'slotted-1-persistent':
            S_th = G * (1 + alpha - Math.exp(-alpha * G)) * Math.exp(-G * (1 + alpha)) * (1 + alpha) * (1 - Math.exp(-alpha * G)) + alpha * Math.exp(-G * (1 + alpha));
            break;
        default:
            console.error('Invalid CSMA selection.');
            S_th = 0;
            break;
    }


    // Display results
    console.log(S_th)
    // Display results
   // Display results
   var throughputResultElement = document.getElementById('throughput-result');
   if (throughputResultElement) {
       // Adjust display logic for small non-zero values
       if (Math.abs(S_th) < 0.01) {
           throughputResultElement.innerHTML = `<p>Throughput: < 0.01 bps</p>`;
       } else {
           throughputResultElement.innerHTML = `<p>Throughput: ${S_th.toFixed(2)} bps</p>`;
       }
   } else {
       console.error('Element with ID "throughput-result" not found.');
   }
}

// Function to toggle MAT Parameters
function toggleMATParameters() {
    var selection = document.getElementById('mat-selection').value;
    var matParameters = document.getElementById('mat-parameters').children;

    // Hide all MAT parameter groups
    for (var i = 0; i < matParameters.length; i++) {
        matParameters[i].style.display = 'none';
    }

    // Show selected MAT parameter group
    document.getElementById(selection).style.display = 'block';

    // Hide other unnecessary MAT parameter groups
    var otherOptions = Array.from(matParameters).filter(param => param.id !== selection);
    otherOptions.forEach(option => option.style.display = 'none');
}

// Attach event listeners after DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {

    // Attach calculateParameters function to the Calculate button click event
    var calculateButton = document.querySelector('#calculator-form button[type="button"]');
    if (calculateButton) {
        calculateButton.addEventListener('click', calculateParameters);
    } else {
        console.error('Calculate button not found.');
    }

    // Attach calculateOFDMParameters function to the Calculate button click event
    var calculateOFDMButton = document.querySelector('section.card:nth-of-type(2) button[type="button"]');
    if (calculateOFDMButton) {
        calculateOFDMButton.addEventListener('click', calculateOFDMParameters);
    } else {
        console.error('OFDM Calculate button not found.');
    }

    // Attach calculateThroughput function to the Calculate button click event
    var calculateThroughputButton = document.querySelector('section.card:nth-of-type(3) button[type="button"]');
    if (calculateThroughputButton) {
        calculateThroughputButton.addEventListener('click', calculateThroughput);
    } else {
        console.error('Throughput Calculate button not found.');
    }

    // Attach toggleMATParameters function to the selection change event
    var matSelection = document.getElementById('mat-selection');
    if (matSelection) {
        matSelection.addEventListener('change', toggleMATParameters);
    } else {
        console.error('MAT selection dropdown not found.');
    }

});
