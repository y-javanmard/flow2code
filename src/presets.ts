/* ═══════════════════════════════════════════════
   presets.ts — Domain-specific node catalogs
   ═══════════════════════════════════════════════ */

export type PresetParam = { name: string; type: string; default: string };

export type PresetNodeTemplate = {
  /** Unique key within the preset, e.g. "conv2d" */
  key: string;
  /** Display label */
  label: string;
  /** Emoji icon */
  icon: string;
  /** Category within the preset for grouping */
  category: string;
  /** Accent color */
  color: string;
  /** Editable params the user can tweak */
  params: PresetParam[];
  /** Description tooltip */
  desc: string;
  /** Output type name (for typed connections) */
  outputType: string;
  /** Accepted input types (for typed connections) */
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

/* ─────────────────────────────────────────
   Neural Networks
   ───────────────────────────────────────── */
const neuralNet: DomainPreset = {
  id: "neural-net",
  name: "Neural Networks",
  icon: "🧠",
  description: "Build neural network architectures visually",
  color: "#8b5cf6",
  templates: [
    // Layers
    { key: "input_layer",  label: "Input",        icon: "📥", category: "Layers",    color: "#059669", params: [{ name: "shape", type: "tuple", default: "(28,28,1)" }], desc: "Input tensor shape", outputType: "tensor", inputTypes: [] },
    { key: "dense",        label: "Dense",        icon: "🔗", category: "Layers",    color: "#2563eb", params: [{ name: "units", type: "int", default: "128" }, { name: "activation", type: "str", default: "relu" }], desc: "Fully connected layer", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "conv2d",       label: "Conv2D",       icon: "🔲", category: "Layers",    color: "#7c3aed", params: [{ name: "filters", type: "int", default: "32" }, { name: "kernel_size", type: "tuple", default: "(3,3)" }, { name: "activation", type: "str", default: "relu" }, { name: "padding", type: "str", default: "same" }], desc: "2D Convolution", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "conv1d",       label: "Conv1D",       icon: "📊", category: "Layers",    color: "#7c3aed", params: [{ name: "filters", type: "int", default: "64" }, { name: "kernel_size", type: "int", default: "3" }, { name: "activation", type: "str", default: "relu" }], desc: "1D Convolution", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "lstm",         label: "LSTM",         icon: "🔁", category: "Layers",    color: "#dc2626", params: [{ name: "units", type: "int", default: "64" }, { name: "return_sequences", type: "bool", default: "False" }], desc: "Long Short-Term Memory", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "gru",          label: "GRU",          icon: "🔁", category: "Layers",    color: "#dc2626", params: [{ name: "units", type: "int", default: "64" }, { name: "return_sequences", type: "bool", default: "False" }], desc: "Gated Recurrent Unit", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "embedding",    label: "Embedding",    icon: "📝", category: "Layers",    color: "#0891b2", params: [{ name: "input_dim", type: "int", default: "10000" }, { name: "output_dim", type: "int", default: "128" }], desc: "Embedding layer for sequences", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "attention",    label: "Attention",    icon: "👁", category: "Layers",    color: "#c026d3", params: [{ name: "heads", type: "int", default: "8" }, { name: "key_dim", type: "int", default: "64" }], desc: "Multi-head attention", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "transformer",  label: "Transformer Block", icon: "⚡", category: "Layers", color: "#c026d3", params: [{ name: "heads", type: "int", default: "8" }, { name: "ff_dim", type: "int", default: "256" }, { name: "dropout", type: "float", default: "0.1" }], desc: "Full transformer encoder block", outputType: "tensor", inputTypes: ["tensor"] },

    // Pooling & Reshape
    { key: "maxpool2d",    label: "MaxPool2D",    icon: "⬇️",  category: "Pooling",   color: "#0d9488", params: [{ name: "pool_size", type: "tuple", default: "(2,2)" }], desc: "Max pooling 2D", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "avgpool2d",    label: "AvgPool2D",    icon: "⬇️",  category: "Pooling",   color: "#0d9488", params: [{ name: "pool_size", type: "tuple", default: "(2,2)" }], desc: "Average pooling 2D", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "globalavgpool", label: "GlobalAvgPool", icon: "🌐", category: "Pooling",   color: "#0d9488", params: [], desc: "Global average pooling", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "flatten",      label: "Flatten",      icon: "📏", category: "Pooling",   color: "#0d9488", params: [], desc: "Flatten to 1D", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "reshape",      label: "Reshape",      icon: "🔀", category: "Pooling",   color: "#0d9488", params: [{ name: "target_shape", type: "tuple", default: "(-1,)" }], desc: "Reshape tensor", outputType: "tensor", inputTypes: ["tensor"] },

    // Regularization
    { key: "dropout",      label: "Dropout",      icon: "💧", category: "Regularization", color: "#d97706", params: [{ name: "rate", type: "float", default: "0.25" }], desc: "Dropout regularization", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "batchnorm",    label: "BatchNorm",    icon: "📐", category: "Regularization", color: "#d97706", params: [], desc: "Batch normalization", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "layernorm",    label: "LayerNorm",    icon: "📐", category: "Regularization", color: "#d97706", params: [], desc: "Layer normalization", outputType: "tensor", inputTypes: ["tensor"] },

    // Operations
    { key: "add",          label: "Add",          icon: "➕", category: "Operations", color: "#64748b", params: [], desc: "Element-wise add (skip connection)", outputType: "tensor", inputTypes: ["tensor", "tensor"] },
    { key: "concatenate",  label: "Concatenate",  icon: "🔗", category: "Operations", color: "#64748b", params: [{ name: "axis", type: "int", default: "-1" }], desc: "Concatenate tensors", outputType: "tensor", inputTypes: ["tensor", "tensor"] },

    // Output
    { key: "output_layer", label: "Output",       icon: "📤", category: "Output",    color: "#be185d", params: [{ name: "units", type: "int", default: "10" }, { name: "activation", type: "str", default: "softmax" }], desc: "Output layer", outputType: "prediction", inputTypes: ["tensor"] },

    // Training
    { key: "compile",      label: "Compile",      icon: "⚙️",  category: "Training",  color: "#374151", params: [{ name: "optimizer", type: "str", default: "adam" }, { name: "loss", type: "str", default: "categorical_crossentropy" }, { name: "metrics", type: "list", default: "['accuracy']" }], desc: "Compile model", outputType: "model", inputTypes: ["prediction"] },
    { key: "fit",          label: "Train / Fit",  icon: "🏋️",  category: "Training",  color: "#374151", params: [{ name: "epochs", type: "int", default: "10" }, { name: "batch_size", type: "int", default: "32" }, { name: "validation_split", type: "float", default: "0.2" }], desc: "Train the model", outputType: "history", inputTypes: ["model"] },
  ],
};

/* ─────────────────────────────────────────
   OOP Design Patterns
   ───────────────────────────────────────── */
const oopPatterns: DomainPreset = {
  id: "oop-patterns",
  name: "OOP Patterns",
  icon: "🏗️",
  description: "Design patterns: Factory, Observer, Strategy, etc.",
  color: "#7c3aed",
  templates: [
    { key: "abstract_class", label: "Abstract Class", icon: "🔷", category: "Creational", color: "#7c3aed", params: [{ name: "name", type: "str", default: "AbstractProduct" }], desc: "Abstract base class", outputType: "class", inputTypes: [] },
    { key: "concrete_class", label: "Concrete Class", icon: "🟦", category: "Creational", color: "#2563eb", params: [{ name: "name", type: "str", default: "ConcreteProduct" }, { name: "extends", type: "ref", default: "" }], desc: "Concrete implementation", outputType: "class", inputTypes: ["class"] },
    { key: "factory",        label: "Factory",        icon: "🏭", category: "Creational", color: "#059669", params: [{ name: "name", type: "str", default: "Factory" }, { name: "creates", type: "ref", default: "" }], desc: "Factory method pattern", outputType: "class", inputTypes: ["class"] },
    { key: "singleton",      label: "Singleton",      icon: "1️⃣",  category: "Creational", color: "#d97706", params: [{ name: "name", type: "str", default: "Singleton" }], desc: "Singleton pattern", outputType: "class", inputTypes: [] },
    { key: "observer_subj",  label: "Subject",        icon: "📡", category: "Behavioral", color: "#dc2626", params: [{ name: "name", type: "str", default: "Subject" }], desc: "Observable subject", outputType: "class", inputTypes: [] },
    { key: "observer_obs",   label: "Observer",       icon: "👀", category: "Behavioral", color: "#be185d", params: [{ name: "name", type: "str", default: "Observer" }, { name: "observes", type: "ref", default: "" }], desc: "Observer / subscriber", outputType: "class", inputTypes: ["class"] },
    { key: "strategy_ctx",   label: "Context",        icon: "🎯", category: "Behavioral", color: "#0891b2", params: [{ name: "name", type: "str", default: "Context" }, { name: "strategy", type: "ref", default: "" }], desc: "Strategy context", outputType: "class", inputTypes: ["class"] },
    { key: "strategy_iface", label: "Strategy Interface", icon: "📋", category: "Behavioral", color: "#0891b2", params: [{ name: "name", type: "str", default: "Strategy" }], desc: "Strategy interface", outputType: "class", inputTypes: [] },
    { key: "decorator",      label: "Decorator",      icon: "🎨", category: "Structural", color: "#c026d3", params: [{ name: "name", type: "str", default: "Decorator" }, { name: "wraps", type: "ref", default: "" }], desc: "Decorator pattern", outputType: "class", inputTypes: ["class"] },
    { key: "adapter",        label: "Adapter",        icon: "🔌", category: "Structural", color: "#64748b", params: [{ name: "name", type: "str", default: "Adapter" }, { name: "adapts", type: "ref", default: "" }], desc: "Adapter pattern", outputType: "class", inputTypes: ["class"] },
    { key: "composite",      label: "Composite",      icon: "🌳", category: "Structural", color: "#0d9488", params: [{ name: "name", type: "str", default: "Composite" }, { name: "component", type: "ref", default: "" }], desc: "Composite pattern", outputType: "class", inputTypes: ["class"] },
  ],
};

/* ─────────────────────────────────────────
   Data Pipeline (ETL)
   ───────────────────────────────────────── */
const dataPipeline: DomainPreset = {
  id: "data-pipeline",
  name: "Data Pipeline",
  icon: "🔄",
  description: "ETL: Sources, Transforms, Sinks",
  color: "#0891b2",
  templates: [
    { key: "source_csv",    label: "CSV Source",     icon: "📄", category: "Sources",    color: "#059669", params: [{ name: "path", type: "str", default: "data.csv" }, { name: "delimiter", type: "str", default: "," }], desc: "Read CSV file", outputType: "dataframe", inputTypes: [] },
    { key: "source_db",     label: "Database",       icon: "🗄️",  category: "Sources",    color: "#059669", params: [{ name: "connection", type: "str", default: "postgres://..." }, { name: "query", type: "str", default: "SELECT * FROM t" }], desc: "Query database", outputType: "dataframe", inputTypes: [] },
    { key: "source_api",    label: "API Source",     icon: "🌐", category: "Sources",    color: "#059669", params: [{ name: "url", type: "str", default: "https://api..." }, { name: "method", type: "str", default: "GET" }], desc: "Fetch from API", outputType: "dataframe", inputTypes: [] },
    { key: "filter",        label: "Filter",         icon: "🔍", category: "Transforms", color: "#2563eb", params: [{ name: "condition", type: "str", default: "col > 0" }], desc: "Filter rows", outputType: "dataframe", inputTypes: ["dataframe"] },
    { key: "map",           label: "Map / Apply",    icon: "🔀", category: "Transforms", color: "#2563eb", params: [{ name: "expression", type: "str", default: "col * 2" }, { name: "column", type: "str", default: "value" }], desc: "Apply transformation", outputType: "dataframe", inputTypes: ["dataframe"] },
    { key: "join",          label: "Join",           icon: "🔗", category: "Transforms", color: "#7c3aed", params: [{ name: "on", type: "str", default: "id" }, { name: "how", type: "str", default: "inner" }], desc: "Join two datasets", outputType: "dataframe", inputTypes: ["dataframe", "dataframe"] },
    { key: "aggregate",     label: "Aggregate",      icon: "📊", category: "Transforms", color: "#7c3aed", params: [{ name: "group_by", type: "str", default: "category" }, { name: "agg", type: "str", default: "sum" }], desc: "Group and aggregate", outputType: "dataframe", inputTypes: ["dataframe"] },
    { key: "sort",          label: "Sort",           icon: "↕️",  category: "Transforms", color: "#2563eb", params: [{ name: "by", type: "str", default: "date" }, { name: "ascending", type: "bool", default: "True" }], desc: "Sort rows", outputType: "dataframe", inputTypes: ["dataframe"] },
    { key: "deduplicate",   label: "Deduplicate",    icon: "🧹", category: "Transforms", color: "#d97706", params: [{ name: "subset", type: "str", default: "id" }], desc: "Remove duplicates", outputType: "dataframe", inputTypes: ["dataframe"] },
    { key: "sink_csv",      label: "CSV Sink",       icon: "💾", category: "Sinks",      color: "#be185d", params: [{ name: "path", type: "str", default: "output.csv" }], desc: "Write to CSV", outputType: "file", inputTypes: ["dataframe"] },
    { key: "sink_db",       label: "DB Sink",        icon: "🗄️",  category: "Sinks",      color: "#be185d", params: [{ name: "table", type: "str", default: "results" }, { name: "if_exists", type: "str", default: "replace" }], desc: "Write to database", outputType: "file", inputTypes: ["dataframe"] },
    { key: "sink_dashboard", label: "Dashboard",     icon: "📈", category: "Sinks",      color: "#be185d", params: [{ name: "chart_type", type: "str", default: "bar" }], desc: "Visualize results", outputType: "visualization", inputTypes: ["dataframe"] },
  ],
};

/* ─────────────────────────────────────────
   API / Microservices
   ───────────────────────────────────────── */
const apiMicro: DomainPreset = {
  id: "api-microservices",
  name: "API / Microservices",
  icon: "🌐",
  description: "REST endpoints, middleware, services",
  color: "#2563eb",
  templates: [
    { key: "endpoint",     label: "Endpoint",      icon: "🎯", category: "Routes",     color: "#059669", params: [{ name: "method", type: "str", default: "GET" }, { name: "path", type: "str", default: "/api/items" }, { name: "auth", type: "bool", default: "True" }], desc: "REST endpoint", outputType: "response", inputTypes: ["request"] },
    { key: "middleware",   label: "Middleware",     icon: "🔒", category: "Routes",     color: "#d97706", params: [{ name: "name", type: "str", default: "authMiddleware" }, { name: "type", type: "str", default: "auth" }], desc: "Middleware layer", outputType: "request", inputTypes: ["request"] },
    { key: "request",      label: "Request",       icon: "📨", category: "Routes",     color: "#2563eb", params: [{ name: "body_schema", type: "str", default: "{ id: int }" }], desc: "Incoming request", outputType: "request", inputTypes: [] },
    { key: "service",      label: "Service",       icon: "⚙️",  category: "Services",   color: "#7c3aed", params: [{ name: "name", type: "str", default: "ItemService" }, { name: "methods", type: "str", default: "getAll, getById, create" }], desc: "Business logic service", outputType: "data", inputTypes: ["request"] },
    { key: "repository",   label: "Repository",    icon: "🗄️",  category: "Services",   color: "#0891b2", params: [{ name: "name", type: "str", default: "ItemRepo" }, { name: "entity", type: "str", default: "Item" }], desc: "Data access layer", outputType: "data", inputTypes: ["data"] },
    { key: "model",        label: "Model / Entity", icon: "📋", category: "Data",       color: "#c026d3", params: [{ name: "name", type: "str", default: "Item" }, { name: "fields", type: "str", default: "id:int, name:str, price:float" }], desc: "Data model", outputType: "schema", inputTypes: [] },
    { key: "validator",    label: "Validator",     icon: "✅", category: "Data",       color: "#0d9488", params: [{ name: "schema", type: "ref", default: "" }, { name: "rules", type: "str", default: "name.required, price.min(0)" }], desc: "Input validation", outputType: "data", inputTypes: ["request"] },
    { key: "response",     label: "Response",      icon: "📤", category: "Routes",     color: "#be185d", params: [{ name: "status", type: "int", default: "200" }, { name: "format", type: "str", default: "json" }], desc: "HTTP response", outputType: "response", inputTypes: ["data"] },
    { key: "queue",        label: "Message Queue", icon: "📬", category: "Messaging",  color: "#dc2626", params: [{ name: "name", type: "str", default: "task_queue" }, { name: "broker", type: "str", default: "redis" }], desc: "Async message queue", outputType: "message", inputTypes: ["data"] },
    { key: "event",        label: "Event",         icon: "⚡", category: "Messaging",  color: "#dc2626", params: [{ name: "name", type: "str", default: "item.created" }], desc: "Domain event", outputType: "event", inputTypes: ["data"] },
  ],
};

/* ─────────────────────────────────────────
   Tensor Networks / MPS
   ───────────────────────────────────────── */
const tensorNet: DomainPreset = {
  id: "tensor-networks",
  name: "Tensor Networks",
  icon: "🔬",
  description: "MPS, DMRG, tensor contractions",
  color: "#0d9488",
  templates: [
    { key: "tensor",       label: "Tensor",         icon: "🧊", category: "Core",         color: "#2563eb", params: [{ name: "name", type: "str", default: "T" }, { name: "shape", type: "tuple", default: "(d, D, D)" }, { name: "dtype", type: "str", default: "complex128" }], desc: "Generic tensor", outputType: "tensor", inputTypes: [] },
    { key: "mps_site",     label: "MPS Site",       icon: "🔗", category: "MPS",          color: "#7c3aed", params: [{ name: "site", type: "int", default: "0" }, { name: "phys_dim", type: "int", default: "2" }, { name: "bond_dim", type: "int", default: "16" }], desc: "Matrix Product State site tensor", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "mpo_site",     label: "MPO Site",       icon: "🔲", category: "MPS",          color: "#c026d3", params: [{ name: "site", type: "int", default: "0" }, { name: "phys_dim", type: "int", default: "2" }, { name: "bond_dim", type: "int", default: "4" }], desc: "Matrix Product Operator site", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "contract",     label: "Contract",       icon: "✖️",  category: "Operations",   color: "#dc2626", params: [{ name: "indices", type: "str", default: "ij,jk->ik" }, { name: "method", type: "str", default: "einsum" }], desc: "Tensor contraction (einsum)", outputType: "tensor", inputTypes: ["tensor", "tensor"] },
    { key: "svd",          label: "SVD",            icon: "✂️",  category: "Operations",   color: "#d97706", params: [{ name: "max_bond", type: "int", default: "32" }, { name: "cutoff", type: "float", default: "1e-10" }], desc: "Singular value decomposition / truncation", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "qr",           label: "QR",             icon: "📐", category: "Operations",   color: "#d97706", params: [{ name: "mode", type: "str", default: "reduced" }], desc: "QR decomposition", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "dmrg",         label: "DMRG Sweep",     icon: "🔄", category: "Algorithms",   color: "#059669", params: [{ name: "sweeps", type: "int", default: "10" }, { name: "max_bond", type: "int", default: "64" }, { name: "cutoff", type: "float", default: "1e-8" }], desc: "DMRG optimization sweep", outputType: "mps", inputTypes: ["tensor"] },
    { key: "tebd",         label: "TEBD Step",      icon: "⏱️",  category: "Algorithms",   color: "#059669", params: [{ name: "dt", type: "float", default: "0.01" }, { name: "order", type: "int", default: "2" }, { name: "max_bond", type: "int", default: "64" }], desc: "Time-Evolving Block Decimation", outputType: "mps", inputTypes: ["tensor"] },
    { key: "hamiltonian",  label: "Hamiltonian",    icon: "🎵", category: "Physics",      color: "#be185d", params: [{ name: "model", type: "str", default: "heisenberg" }, { name: "J", type: "float", default: "1.0" }, { name: "h", type: "float", default: "0.0" }], desc: "Local Hamiltonian", outputType: "tensor", inputTypes: [] },
    { key: "measure",      label: "Measure",        icon: "📏", category: "Physics",      color: "#64748b", params: [{ name: "observable", type: "str", default: "Sz" }, { name: "site", type: "str", default: "all" }], desc: "Expectation value measurement", outputType: "scalar", inputTypes: ["mps", "tensor"] },
    { key: "peps_tensor",  label: "PEPS Tensor",    icon: "🔷", category: "2D Networks",  color: "#0891b2", params: [{ name: "phys_dim", type: "int", default: "2" }, { name: "bond_dim", type: "int", default: "4" }], desc: "Projected Entangled Pair State tensor", outputType: "tensor", inputTypes: ["tensor"] },
    { key: "isometry",     label: "Isometry",       icon: "🔺", category: "Operations",   color: "#0d9488", params: [{ name: "in_dim", type: "int", default: "4" }, { name: "out_dim", type: "int", default: "2" }], desc: "Isometric tensor (MERA)", outputType: "tensor", inputTypes: ["tensor"] },
  ],
};

/* ─────────────────────────────────────────
   All presets
   ───────────────────────────────────────── */
export const allPresets: DomainPreset[] = [
  neuralNet,
  oopPatterns,
  dataPipeline,
  apiMicro,
  tensorNet,
];

export function getPresetById(id: string): DomainPreset | undefined {
  return allPresets.find((p) => p.id === id);
}