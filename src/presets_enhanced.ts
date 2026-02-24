/* ═════════════════════════════════════════════════════
   ARCHITECTURE TEMPLATES — Pre-built model blueprints
   ═════════════════════════════════════════════════════ */

export type ArchitectureTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "vision" | "sequence" | "nlp" | "hybrid" | "classic";
  tags: string[];
  complexity: "beginner" | "intermediate" | "advanced";
  nodes: Array<{
    templateKey: string;
    label: string;
    params: Record<string, string>;
  }>;
  connections: Array<{ from: number; to: number }>;
};

export const architectureTemplates: ArchitectureTemplate[] = [
  // ═══ VISION / IMAGE ═══
  {
    id: "arch-mnist-cnn",
    name: "LeNet-style (MNIST)",
    description: "Simple CNN for handwritten digit recognition. Fast training, good baseline.",
    icon: "🔢",
    category: "vision",
    tags: ["CNN", "Image", "Beginner"],
    complexity: "beginner",
    nodes: [
      { templateKey: "input_layer", label: "Input (28×28)", params: { shape: "(28,28,1)" } },
      { templateKey: "conv2d", label: "Conv 32×3×3", params: { filters: "32", kernel_size: "(3,3)", activation: "relu", padding: "same" } },
      { templateKey: "maxpool2d", label: "MaxPool 2×2", params: { pool_size: "(2,2)" } },
      { templateKey: "conv2d", label: "Conv 64×3×3", params: { filters: "64", kernel_size: "(3,3)", activation: "relu", padding: "same" } },
      { templateKey: "maxpool2d", label: "MaxPool 2×2", params: { pool_size: "(2,2)" } },
      { templateKey: "flatten", label: "Flatten", params: {} },
      { templateKey: "dense", label: "Dense 128", params: { units: "128", activation: "relu" } },
      { templateKey: "dropout", label: "Dropout 0.25", params: { rate: "0.25" } },
      { templateKey: "output_layer", label: "Output 10", params: { units: "10", activation: "softmax" } },
    ],
    connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8]],
  },

  {
    id: "arch-resnet50",
    name: "ResNet-50 (with Skip Connections)",
    description: "Residual network with skip connections. Deeper networks without vanishing gradients.",
    icon: "🔁",
    category: "vision",
    tags: ["CNN", "Skip Connection", "ImageNet"],
    complexity: "intermediate",
    nodes: [
      { templateKey: "input_layer", label: "Input (224×224)", params: { shape: "(224,224,3)" } },
      { templateKey: "conv2d", label: "Conv 64×7×7 (stride=2)", params: { filters: "64", kernel_size: "(7,7)", activation: "relu", padding: "same" } },
      { templateKey: "maxpool2d", label: "MaxPool 3×3", params: { pool_size: "(3,3)" } },
      { templateKey: "conv2d", label: "ResBlock 64×3×3 #1", params: { filters: "64", kernel_size: "(3,3)", activation: "relu", padding: "same" } },
      { templateKey: "conv2d", label: "ResBlock 64×3×3 #2", params: { filters: "64", kernel_size: "(3,3)", activation: "relu", padding: "same" } },
      { templateKey: "add", label: "Skip Add (64)", params: {} },
      { templateKey: "conv2d", label: "ResBlock 128×3×3", params: { filters: "128", kernel_size: "(3,3)", activation: "relu", padding: "same" } },
      { templateKey: "conv2d", label: "ResBlock 256×3×3", params: { filters: "256", kernel_size: "(3,3)", activation: "relu", padding: "same" } },
      { templateKey: "globalavgpool", label: "GlobalAvgPool", params: {} },
      { templateKey: "dense", label: "Dense 1024", params: { units: "1024", activation: "relu" } },
      { templateKey: "dropout", label: "Dropout 0.5", params: { rate: "0.5" } },
      { templateKey: "output_layer", label: "Output 1000", params: { units: "1000", activation: "softmax" } },
    ],
    connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[2,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11]],
  },

  {
    id: "arch-vgg16",
    name: "VGG-16 (Stacked Conv Blocks)",
    description: "Deep stack of 3×3 convolutions. Classic architecture, interpretable features.",
    icon: "📚",
    category: "vision",
    tags: ["CNN", "ImageNet", "Deep"],
    complexity: "intermediate",
    nodes: [
      { templateKey: "input_layer", label: "Input (224×224)", params: { shape: "(224,224,3)" } },
      { templateKey: "conv2d", label: "Conv 64", params: { filters: "64", kernel_size: "(3,3)", activation: "relu", padding: "same" } },
      { templateKey: "conv2d", label: "Conv 64", params: { filters: "64", kernel_size: "(3,3)", activation: "relu", padding: "same" } },
      { templateKey: "maxpool2d", label: "MaxPool", params: { pool_size: "(2,2)" } },
      { templateKey: "conv2d", label: "Conv 128", params: { filters: "128", kernel_size: "(3,3)", activation: "relu", padding: "same" } },
      { templateKey: "conv2d", label: "Conv 128", params: { filters: "128", kernel_size: "(3,3)", activation: "relu", padding: "same" } },
      { templateKey: "maxpool2d", label: "MaxPool", params: { pool_size: "(2,2)" } },
      { templateKey: "conv2d", label: "Conv 256×3", params: { filters: "256", kernel_size: "(3,3)", activation: "relu", padding: "same" } },
      { templateKey: "conv2d", label: "Conv 256", params: { filters: "256", kernel_size: "(3,3)", activation: "relu", padding: "same" } },
      { templateKey: "conv2d", label: "Conv 256", params: { filters: "256", kernel_size: "(3,3)", activation: "relu", padding: "same" } },
      { templateKey: "maxpool2d", label: "MaxPool", params: { pool_size: "(2,2)" } },
      { templateKey: "flatten", label: "Flatten", params: {} },
      { templateKey: "dense", label: "Dense 512", params: { units: "512", activation: "relu" } },
      { templateKey: "dropout", label: "Dropout 0.5", params: { rate: "0.5" } },
      { templateKey: "dense", label: "Dense 512", params: { units: "512", activation: "relu" } },
      { templateKey: "dropout", label: "Dropout 0.5", params: { rate: "0.5" } },
      { templateKey: "output_layer", label: "Output 1000", params: { units: "1000", activation: "softmax" } },
    ],
    connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11],[11,12],[12,13],[13,14],[14,15],[15,16]],
  },

  {
    id: "arch-mobilenet",
    name: "MobileNet (Lightweight)",
    description: "Efficient CNN for mobile/edge devices. Lower parameters, faster inference.",
    icon: "📱",
    category: "vision",
    tags: ["CNN", "Efficient", "Mobile"],
    complexity: "intermediate",
    nodes: [
      { templateKey: "input_layer", label: "Input (224×224)", params: { shape: "(224,224,3)" } },
      { templateKey: "conv2d", label: "Conv 32", params: { filters: "32", kernel_size: "(3,3)", activation: "relu", padding: "same" } },
      { templateKey: "conv2d", label: "DepthwiseConv", params: { filters: "32", kernel_size: "(3,3)", activation: "relu", padding: "same" } },
      { templateKey: "conv2d", label: "Conv 64", params: { filters: "64", kernel_size: "(1,1)", activation: "relu", padding: "same" } },
      { templateKey: "maxpool2d", label: "MaxPool", params: { pool_size: "(2,2)" } },
      { templateKey: "conv2d", label: "DepthwiseConv", params: { filters: "64", kernel_size: "(3,3)", activation: "relu", padding: "same" } },
      { templateKey: "conv2d", label: "Conv 128", params: { filters: "128", kernel_size: "(1,1)", activation: "relu", padding: "same" } },
      { templateKey: "globalavgpool", label: "GlobalAvgPool", params: {} },
      { templateKey: "dense", label: "Dense 1024", params: { units: "1024", activation: "relu" } },
      { templateKey: "output_layer", label: "Output 1000", params: { units: "1000", activation: "softmax" } },
    ],
    connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9]],
  },

  // ═══ SEQUENCE / RNN ═══
  {
    id: "arch-seq2seq",
    name: "Seq2Seq (Encoder-Decoder)",
    description: "Sequence-to-sequence for translation, summarization. LSTM-based encoder-decoder.",
    icon: "↔️",
    category: "sequence",
    tags: ["RNN", "LSTM", "NLP"],
    complexity: "intermediate",
    nodes: [
      { templateKey: "input_layer", label: "Input Sequence", params: { shape: "(seq_length,)" } },
      { templateKey: "embedding", label: "Embedding 128", params: { input_dim: "10000", output_dim: "128" } },
      { templateKey: "lstm", label: "LSTM Encoder 256", params: { units: "256", return_sequences: "False" } },
      { templateKey: "dense", label: "Dense 256", params: { units: "256", activation: "relu" } },
      { templateKey: "lstm", label: "LSTM Decoder 256", params: { units: "256", return_sequences: "True" } },
      { templateKey: "dense", label: "Output Dense", params: { units: "5000", activation: "softmax" } },
    ],
    connections: [[0,1],[1,2],[2,3],[3,4],[4,5]],
  },

  {
    id: "arch-gru-text",
    name: "GRU for Text Classification",
    description: "GRU-based classifier for sentiment or intent. Faster than LSTM with similar performance.",
    icon: "📝",
    category: "sequence",
    tags: ["RNN", "GRU", "Text"],
    complexity: "beginner",
    nodes: [
      { templateKey: "input_layer", label: "Input Text", params: { shape: "(max_length,)" } },
      { templateKey: "embedding", label: "Embedding 128", params: { input_dim: "5000", output_dim: "128" } },
      { templateKey: "gru", label: "GRU 128", params: { units: "128", return_sequences: "True" } },
      { templateKey: "gru", label: "GRU 64", params: { units: "64", return_sequences: "False" } },
      { templateKey: "dense", label: "Dense 64", params: { units: "64", activation: "relu" } },
      { templateKey: "dropout", label: "Dropout 0.3", params: { rate: "0.3" } },
      { templateKey: "output_layer", label: "Output 2", params: { units: "2", activation: "softmax" } },
    ],
    connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
  },

  // ═══ TRANSFORMER / NLP ═══
  {
    id: "arch-transformer",
    name: "Transformer (GPT-style)",
    description: "Multi-head self-attention architecture. State-of-the-art for NLP tasks.",
    icon: "⚡",
    category: "nlp",
    tags: ["Transformer", "Attention", "NLP"],
    complexity: "advanced",
    nodes: [
      { templateKey: "input_layer", label: "Input Tokens", params: { shape: "(seq_len,)" } },
      { templateKey: "embedding", label: "Token Embedding 512", params: { input_dim: "50000", output_dim: "512" } },
      { templateKey: "transformer", label: "TransformerBlock #1", params: { heads: "8", ff_dim: "2048", dropout: "0.1" } },
      { templateKey: "transformer", label: "TransformerBlock #2", params: { heads: "8", ff_dim: "2048", dropout: "0.1" } },
      { templateKey: "transformer", label: "TransformerBlock #3", params: { heads: "8", ff_dim: "2048", dropout: "0.1" } },
      { templateKey: "layernorm", label: "LayerNorm", params: {} },
      { templateKey: "dense", label: "Dense 512", params: { units: "512", activation: "relu" } },
      { templateKey: "output_layer", label: "Output (vocab)", params: { units: "50000", activation: "softmax" } },
    ],
    connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]],
  },

  {
    id: "arch-bert",
    name: "BERT-like (Bi-directional)",
    description: "Bidirectional transformer for contextual embeddings. Pre-training + fine-tuning workflow.",
    icon: "📖",
    category: "nlp",
    tags: ["Transformer", "BERT", "NLP"],
    complexity: "advanced",
    nodes: [
      { templateKey: "input_layer", label: "Input Tokens", params: { shape: "(512,)" } },
      { templateKey: "embedding", label: "Token Embedding 768", params: { input_dim: "30000", output_dim: "768" } },
      { templateKey: "transformer", label: "EncoderBlock #1", params: { heads: "12", ff_dim: "3072", dropout: "0.1" } },
      { templateKey: "transformer", label: "EncoderBlock #2", params: { heads: "12", ff_dim: "3072", dropout: "0.1" } },
      { templateKey: "transformer", label: "EncoderBlock #3", params: { heads: "12", ff_dim: "3072", dropout: "0.1" } },
      { templateKey: "dense", label: "Pooling / CLS", params: { units: "768", activation: "relu" } },
      { templateKey: "output_layer", label: "Output (classes)", params: { units: "2", activation: "softmax" } },
    ],
    connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
  },

  {
    id: "arch-vit",
    name: "Vision Transformer (ViT)",
    description: "Apply transformer to image patches. State-of-the-art vision model.",
    icon: "👁️",
    category: "nlp",
    tags: ["Transformer", "Vision", "Patches"],
    complexity: "advanced",
    nodes: [
      { templateKey: "input_layer", label: "Input (224×224)", params: { shape: "(224,224,3)" } },
      { templateKey: "conv2d", label: "Patch Embedding", params: { filters: "768", kernel_size: "(16,16)", activation: "linear", padding: "valid" } },
      { templateKey: "flatten", label: "Flatten Patches", params: {} },
      { templateKey: "embedding", label: "Position Embedding", params: { input_dim: "196", output_dim: "768" } },
      { templateKey: "transformer", label: "TransformerBlock #1", params: { heads: "12", ff_dim: "3072", dropout: "0.1" } },
      { templateKey: "transformer", label: "TransformerBlock #2", params: { heads: "12", ff_dim: "3072", dropout: "0.1" } },
      { templateKey: "layernorm", label: "LayerNorm", params: {} },
      { templateKey: "dense", label: "Classification Head", params: { units: "1024", activation: "relu" } },
      { templateKey: "output_layer", label: "Output Classes", params: { units: "1000", activation: "softmax" } },
    ],
    connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8]],
  },

  // ═══ HYBRID ═══
  {
    id: "arch-cnn-rnn",
    name: "CNN + RNN (Video/Caption)",
    description: "Combine CNN feature extractor with RNN sequence model. Perfect for video classification or image captioning.",
    icon: "🎬",
    category: "hybrid",
    tags: ["CNN", "RNN", "Fusion"],
    complexity: "intermediate",
    nodes: [
      { templateKey: "input_layer", label: "Input (frames)", params: { shape: "(num_frames,h,w,c)" } },
      { templateKey: "conv2d", label: "CNN Backbone 64", params: { filters: "64", kernel_size: "(3,3)", activation: "relu", padding: "same" } },
      { templateKey: "maxpool2d", label: "MaxPool", params: { pool_size: "(2,2)" } },
      { templateKey: "conv2d", label: "CNN 128", params: { filters: "128", kernel_size: "(3,3)", activation: "relu", padding: "same" } },
      { templateKey: "globalavgpool", label: "GlobalAvgPool", params: {} },
      { templateKey: "lstm", label: "LSTM 256", params: { units: "256", return_sequences: "True" } },
      { templateKey: "lstm", label: "LSTM 128", params: { units: "128", return_sequences: "False" } },
      { templateKey: "dense", label: "Dense 256", params: { units: "256", activation: "relu" } },
      { templateKey: "output_layer", label: "Output", params: { units: "10", activation: "softmax" } },
    ],
    connections: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8]],
  },

  {
    id: "arch-multimodal",
    name: "Multimodal (Image + Text)",
    description: "Fuse vision and language. CLIP-style or VQA architecture.",
    icon: "🖼️",
    category: "hybrid",
    tags: ["Multimodal", "Vision", "Language"],
    complexity: "advanced",
    nodes: [
      { templateKey: "input_layer", label: "Image Input", params: { shape: "(224,224,3)" } },
      { templateKey: "conv2d", label: "CNN Encoder", params: { filters: "64", kernel_size: "(3,3)", activation: "relu", padding: "same" } },
      { templateKey: "globalavgpool", label: "GlobalAvgPool", params: {} },
      { templateKey: "dense", label: "Vision Projection", params: { units: "512", activation: "relu" } },
      { templateKey: "input_layer", label: "Text Input", params: { shape: "(max_len,)" } },
      { templateKey: "embedding", label: "Text Embedding", params: { input_dim: "10000", output_dim: "256" } },
      { templateKey: "lstm", label: "Text LSTM", params: { units: "256", return_sequences: "False" } },
      { templateKey: "dense", label: "Text Projection", params: { units: "512", activation: "relu" } },
      { templateKey: "concatenate", label: "Fuse (concat)", params: { axis: "-1" } },
      { templateKey: "dense", label: "Fusion Layer", params: { units: "512", activation: "relu" } },
      { templateKey: "output_layer", label: "Output", params: { units: "10", activation: "softmax" } },
    ],
    connections: [[0,1],[1,2],[2,3],[4,5],[5,6],[6,7],[3,8],[7,8],[8,9],[9,10]],
  },
];

export type PresetParam = { name: string; type: string; default: string };

export type PresetNodeTemplate = {
  key: string;
  label: string;
  icon: string;
  category: string;
  color: string;
  params: PresetParam[];
  desc: string;
  outputType: string;
  inputTypes: string[];
};

export type DomainPreset = {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  templates: PresetNodeTemplate[];
};

// ... rest of presets remain the same ...
