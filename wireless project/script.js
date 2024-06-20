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

    // Attach toggleMATParameters function to the selection change event
    var matSelection = document.getElementById('mat-selection');
    if (matSelection) {
        matSelection.addEventListener('change', toggleMATParameters);
    } else {
        console.error('MAT selection dropdown not found.');
    }
     // Function to calculate Unslotted Nonpersistent CSMA throughput
function calculateUnslottedNonpersistent(trafficLoad, propagationDelay, packetTransmissionTime) {
    var alpha = trafficLoad * packetTransmissionTime;
    var T = propagationDelay * packetTransmissionTime;
    var G = Math.exp(-alpha);

    return (G * Math.exp(-2 * alpha * T) * G * (1 + 2 * alpha) + Math.exp(-alpha * G)) / (1 + 2 * alpha);
}

// Function to calculate Slotted Nonpersistent CSMA throughput
function calculateSlottedNonpersistent(trafficLoad, propagationDelay, packetTransmissionTime) {
    var alpha = trafficLoad * packetTransmissionTime;
    var T = propagationDelay * packetTransmissionTime;
    var G = Math.exp(-alpha);

    return (alpha * G * Math.exp(-2 * alpha * T) * (1 - Math.exp(-alpha * G) + alpha)) / (1 + 2 * alpha);
}

// Function to calculate Unslotted 1-Persistent CSMA throughput
function calculateUnslotted1Persistent(trafficLoad, propagationDelay) {
    var alpha = trafficLoad * propagationDelay;
    var G = Math.exp(-propagationDelay * (1 + 2 * alpha));
    
    return (G * (1 + G + alpha * G * (1 + G + alpha * Math.pow(G, 2))) * Math.exp(-propagationDelay * (1 + 2 * alpha))) / 
           (G * (1 + 2 * alpha) - (1 - Math.exp(-alpha * G)) + (1 + alpha * G) * Math.exp(-propagationDelay * (1 + alpha)));
}

// Function to calculate Slotted 1-Persistent CSMA throughput
function calculateSlotted1Persistent(trafficLoad, propagationDelay) {
    var alpha = trafficLoad * propagationDelay;
    var G = Math.exp(-propagationDelay * (1 + alpha));
    
    return (G * (1 + alpha - Math.exp(-Math.pow(G, 2))) * Math.exp(-propagationDelay * (1 + alpha))) / 
           ((1 + alpha) * (1 - Math.exp(-alpha * G)) + alpha * Math.exp(-propagationDelay * (1 + alpha)));
}

// Function to calculate throughput based on selected MAT
function calculateThroughput() {
    var selection = document.getElementById('mat-selection').value;
    var throughput;

    switch (selection) {
        case 'unslotted-nonpersistent':
            var trafficLoadUNP = parseFloat(document.getElementById('traffic-load-unslotted').value.trim());
            var propagationDelayUNP = parseFloat(document.getElementById('normalized-propagation-delay-unslotted').value.trim());
            var packetTransmissionTimeUNP = parseFloat(document.getElementById('packet-transmission-time-unslotted').value.trim());

            throughput = calculateUnslottedNonpersistent(trafficLoadUNP, propagationDelayUNP, packetTransmissionTimeUNP);
            break;

        case 'slotted-nonpersistent':
            var trafficLoadSNP = parseFloat(document.getElementById('traffic-load-slotted').value.trim());
            var propagationDelaySNP = parseFloat(document.getElementById('normalized-propagation-delay-slotted').value.trim());
            var packetTransmissionTimeSNP = parseFloat(document.getElementById('packet-transmission-time-slotted').value.trim());

            throughput = calculateSlottedNonpersistent(trafficLoadSNP, propagationDelaySNP, packetTransmissionTimeSNP);
            break;

        case 'unslotted-1-persistent':
            var trafficLoad1P = parseFloat(document.getElementById('traffic-load-1-persistent').value.trim());
            var propagationDelay1P = parseFloat(document.getElementById('normalized-propagation-delay-1-persistent').value.trim());

            throughput = calculateUnslotted1Persistent(trafficLoad1P, propagationDelay1P);
            break;

        case 'slotted-1-persistent':
            var trafficLoadS1P = parseFloat(document.getElementById('traffic-load-slotted-1-persistent').value.trim());
            var propagationDelayS1P = parseFloat(document.getElementById('normalized-propagation-delay-slotted-1-persistent').value.trim());

            throughput = calculateSlotted1Persistent(trafficLoadS1P, propagationDelayS1P);
            break;

        default:
            console.error('Invalid selection.');
            return;
    }

    // Display throughput result
    document.getElementById('throughput-result').innerHTML = `<p>Throughput: ${throughput.toFixed(2)} bps</p>`;
}

    // Attach calculateOFDMParameters function to the Calculate button click event
    var calculateOFDMButton = document.querySelector('section.card:nth-of-type(2) button[type="button"]');
    if (calculateOFDMButton) {
        calculateOFDMButton.addEventListener('click', calculateOFDMParameters);
    } else {
        console.error('OFDM Calculate button not found.');
    }
});
