'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { MapPin, FileSpreadsheet, Ampersand, CastleIcon, FileUser, LucideChartNoAxesCombined, DollarSign } from 'lucide-react';

export default function Home() {
  const [buttonText, setButtonText] = useState('Comece agora');
  const [buttonBg, setButtonBg] = useState('bg-indigo-500');

  // Textos para a animação do título
  const titleParts = [
    { text: 'Encontre mais clientes', delay: 0.2 },
    { text: 'Com a nossa IA', delay: 0.8 },
  ];

  const descriptionText = 'O agente de inteligência artificial que te ajuda a encontrar clientes não atendidos na sua região.';

  // Efeitos para as partes do título
  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };

  // Efeitos para o botão
  const buttonVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
    hover: { scale: 1.05, backgroundColor: 'var(--hover-bg)' },
  };

  // Estado para controlar a animação dos caminhos SVG
  const [pathsAnimated, setPathsAnimated] = useState(false);

  useEffect(() => {
    const buttonInterval = setInterval(() => {
      setButtonText((prev) =>
        prev === 'Comece agora' ? 'Transforme suas vendas!' : 'Comece agora'
      );
      setButtonBg((prev) =>
        prev === 'bg-indigo-500' ? 'bg-purple-600' : 'bg-indigo-500'
      );
    }, 3000);

    const pathsTimer = setTimeout(() => {
      setPathsAnimated(true);
    }, 3000);

    return () => {
      clearInterval(buttonInterval);
      clearTimeout(pathsTimer);
    };
  }, []);

  // Dados para os "nós" de entrada e saída
  const inputNodes = [
    { id: 'cadastrais', label: 'Códigos CNAEs', icon: Ampersand },
    { id: 'fiscais', label: 'Nomes Empresariais', icon: CastleIcon },
    { id: 'online', label: 'Regime Tributário', icon: DollarSign },
    { id: 'economicos', label: 'Porte da Empresa', icon: LucideChartNoAxesCombined },
    { id: 'comerciais', label: 'Região de Atuação', icon: MapPin },
    { id: 'consumo', label: 'Dados dos Sócios', icon: FileUser },
  ];

  const outputNodes = [
    { id: 'geolocalizacao', label: 'Mapas de Oportunidades', icon: MapPin, description: 'Descubra novas áreas de atuação' },
    { id: 'excel', label: 'Exportação para Excel', icon: FileSpreadsheet, description: 'Baixe seus dados em segundos' },
  ];

  // Definindo as dimensões fixas (ajuste esses valores conforme o CSS real dos seus elementos)
  const nodeDimensions = {
    input: { width: 200, height: 40 },
    ai: { width: 100, height: 100, radius: 50 },
    output: { width: 350, height: 150 }, // Dimensões dos novos containers maiores
  };

  // As posições agora são relativas ao contêiner do diagrama (viewBox 1000x500)
  // E representam o CENTRO de cada nó (cx, cy)
  const nodePositions = {
    // Esquerda
    cadastrais: { cx: 100, cy: nodeDimensions.input.height / 2 + 0 },
    fiscais:    { cx: 100, cy: nodeDimensions.input.height / 2 + 100 },
    online:     { cx: 100, cy: nodeDimensions.input.height / 2 + 200 },
    // Direita
    economicos: { cx: 1000 - 90, cy: nodeDimensions.input.height / 2 + 0 },
    comerciais: { cx: 1000 - 90, cy: nodeDimensions.input.height / 2 + 100 },
    consumo:    { cx: 1000 - 90, cy: nodeDimensions.input.height / 2 + 200 },
    // Centro da IA
    ai:         { cx: 500, cy: 150 }, // IA mais acima no diagrama
    // SAÍDAS: Posicione os *centros* dos seus novos containers grandes
    // Ajuste estes valores de cx e cy para posicionar os containers no lugar certo
    geolocalizacao: { cx: 500 - 200, cy: 420 }, // Exemplo: 150px à esquerda do centro, em y=400
    excel:          { cx: 500 + 200, cy: 420 }, // Exemplo: 150px à direita do centro, em y=400
  };

  // Função para calcular o ponto de conexão na borda de um retângulo
  
  type PointRect = {
  cx: number;
  cy: number;
  width: number;
  height: number;
  };
  
  const getRectConnectionPoint = (rect: PointRect, targetPoint: PointRect) => {
    const { cx, cy, width, height } = rect;
    const dx = targetPoint.cx - cx;
    const dy = targetPoint.cy - cy;

    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    let x = cx;
    let y = cy;

    // Tenta interseção com as bordas verticais (esquerda/direita)
    if (absDx > 1e-6) {
        const slope = dy / dx;
        const intersectY = cy + slope * (Math.sign(dx) * halfWidth);
        if (intersectY >= cy - halfHeight && intersectY <= cy + halfHeight) {
            x = cx + Math.sign(dx) * halfWidth;
            y = intersectY;
            return { x, y };
        }
    }

    // Tenta interseção com as bordas horizontais (superior/inferior)
    if (absDy > 1e-6) {
        const invSlope = dx / dy;
        const intersectX = cx + invSlope * (Math.sign(dy) * halfHeight);
        if (intersectX >= cx - halfWidth && intersectX <= cx + halfWidth) {
            y = cy + Math.sign(dy) * halfHeight;
            x = intersectX;
            return { x, y };
        }
    }

    // Fallback para casos em que a linha cruza exatamente um canto ou está alinhada a um eixo
    if (dx === 0 && dy === 0) return { x: cx, y: cy };
    if (absDx === 0) return { x: cx, y: cy + Math.sign(dy) * halfHeight };
    if (absDy === 0) return { x: cx + Math.sign(dx) * halfWidth, y: cy };

    const angle = Math.atan2(dy, dx);
    const tanRatio = Math.tan(angle);

    if (Math.abs(tanRatio) * halfWidth <= halfHeight) {
        x = cx + Math.sign(dx) * halfWidth;
        y = cy + tanRatio * Math.sign(dx) * halfWidth;
    } else {
        y = cy + Math.sign(dy) * halfHeight;
        x = cx + (1 / tanRatio) * Math.sign(dy) * halfHeight;
    }
    return { x, y };
  };

  // Função para calcular o ponto de conexão na borda de um círculo
  
  type Circle = {
  cx: number;
  cy: number;
  radius: number;
  };
  
  const getCircleConnectionPoint = (circle: Circle, targetPoint: PointRect) => {
    const { cx, cy, radius } = circle;
    const dx = targetPoint.cx - cx;
    const dy = targetPoint.cy - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance === 0) return { x: cx, y: cy };
    return {
      x: cx + (dx * radius) / distance,
      y: cy + (dy * radius) / distance,
    };
  };

  // Função para desenhar o caminho SVG
  const getPathD = (startId, endId) => {
    const startNode = nodePositions?.[startId];
    const endNode = nodePositions?.[endId];

    if (!startNode || !endNode) return "";

    let startPoint, endPoint;

    // Calcular ponto de partida na borda do nó inicial
    if (startId === 'ai') {
      startPoint = getCircleConnectionPoint(
        { cx: startNode.cx, cy: startNode.cy, radius: nodeDimensions.ai.radius },
        endNode
      );
    } else { // Nó de entrada (retângulo)
      startPoint = getRectConnectionPoint(
        { cx: startNode.cx, cy: startNode.cy, width: nodeDimensions.input.width, height: nodeDimensions.input.height },
        endNode
      );
    }

    // Calcular ponto de chegada na borda do nó final
    if (endId === 'ai') {
      endPoint = getCircleConnectionPoint(
        { cx: endNode.cx, cy: endNode.cy, radius: nodeDimensions.ai.radius },
        startNode
      );
    } else { // Nó de saída (retângulo)
      endPoint = getRectConnectionPoint(
        { cx: endNode.cx, cy: endNode.cy, width: nodeDimensions.output.width, height: nodeDimensions.output.height },
        startNode
      );
    }

    let cp1x, cp1y, cp2x, cp2y;

    // Se a linha vai da IA para os nós de saída (abaixo)
    if (startId === 'ai' && (endId === 'geolocalizacao' || endId === 'excel')) {
        // Para uma curva mais "para baixo" da IA e depois abre para o nó de saída
        cp1x = startPoint.x;
        cp1y = startPoint.y + (endPoint.y - startPoint.y) * 0.3; // Ponto de controle 1: sai da IA para baixo

        cp2x = endPoint.x;
        cp2y = endPoint.y - (endPoint.y - startPoint.y) * 0.3; // Ponto de controle 2: entra no nó de baixo para cima
    }
    // Se a linha vai dos nós de entrada para a IA
    else if (endId === 'ai') {
        cp1x = startPoint.x + (endPoint.x - startPoint.x) * 0.3; // Ajuste horizontal para as curvas
        cp1y = startPoint.y;

        cp2x = endPoint.x - (endPoint.x - startPoint.x) * 0.3; // Ajuste horizontal para as curvas
        cp2y = endPoint.y;
    }
    // Caso geral ou fallback
    else {
        cp1x = startPoint.x + (endPoint.x - startPoint.x) * 0.3;
        cp1y = startPoint.y;
        cp2x = endPoint.x - (endPoint.x - startPoint.x) * 0.3;
        cp2y = endPoint.y;
    }

    return `M${startPoint.x},${startPoint.y} C${cp1x},${cp1y} ${cp2x},${cp2y} ${endPoint.x},${endPoint.y}`;
  };


  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      {/* Navbar (mantida como está) */}
      <nav className="flex justify-between items-center px-8 py-6 z-20 relative">
        <h1 className="text-2xl font-bold tracking-wide">VENDAS EM ESCALA</h1>
        <ul className="flex gap-6 text-sm font-medium">
          <li><a href="#vantagens" className="hover:text-indigo-300">Vantagens</a></li>
          <li><a href="#beneficios" className="hover:text-indigo-300">Benefícios</a></li>
          <li><a href="#diferenciais" className="hover:text-indigo-300">Diferenciais</a></li>
          <li><button className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-500">Login</button></li>
        </ul>
      </nav>

      {/* Hero Section */}
      <section
        className="flex flex-col items-center justify-center flex-grow py-10 px-6 overflow-hidden relative mb-[-150px]" // <-- ADICIONADO AQUI
        style={{
          // Você pode adicionar a imagem de fundo aqui, como discutido anteriormente:
          // backgroundImage: 'url("/images/seu-background-aqui.jpg")',
          // backgroundSize: 'cover',
          // backgroundPosition: 'center',
          // backgroundRepeat: 'no-repeat',
          // backgroundColor: 'rgba(0, 0, 0, 0.7)', // Para um overlay escuro
        }}
      >
        {/* Título */}
        <h2 className="text-5xl md:text-6xl font-extrabold max-w-4xl leading-tight mb-4 text-center z-10">
          {titleParts.map((part, index) => (
            <motion.span
              key={index}
              variants={titleVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: part.delay }}
              className="inline-block mx-1"
            >
              {part.text}
            </motion.span>
          ))}
        </h2>

        {/* Descrição */}
        <motion.p
          className="text-slate-300 max-w-xl mb-8 text-lg text-center z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          {descriptionText}
        </motion.p>

        {/* Botão */}
        <motion.button
          className={`${buttonBg} text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg transition-all duration-500 ease-in-out mb-20 z-10`}
          variants={buttonVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          transition={{ delay: 2, duration: 0.5 }}
          style={{ '--hover-bg': buttonBg === 'bg-indigo-500' ? '#4f46e5' : '#8B5CF6' }}
        >
          {buttonText} <span className="ml-2">→</span>
        </motion.button>

        {/* Contêiner para o Diagrama de Rede (abaixo do botão) */}
        <div className="relative w-full max-w-[1000px] h-[500px] mx-auto mt-[-50px] pointer-events-none">
          {/* SVG para as linhas */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 500">
            {/* Linhas de Entrada para IA */}
            {inputNodes.map((node, index) => (
              <motion.path
                key={`path-${node.id}-to-ai`}
                d={getPathD(node.id, 'ai')}
                stroke="rgba(109, 40, 217, 0.7)"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={pathsAnimated ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.5 + (index * 0.05) }}
              />
            ))}
            {/* Linhas da IA para as Saídas */}
            {outputNodes.map((node, index) => (
              <motion.path
                key={`path-ai-to-${node.id}`}
                d={getPathD('ai', node.id)}
                stroke="gray"
                strokeWidth="2"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={pathsAnimated ? { pathLength: 1 } : { pathLength: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 2.0 + (index * 0.05) }}
              />
            ))}
          </svg>

          {/* Nós de Entrada */}
          {inputNodes.map((node, index) => (
            <motion.div
              key={node.id}
              className={`absolute p-3 rounded-xl shadow-lg bg-gray-700 text-white flex items-center gap-2 text-sm whitespace-nowrap opacity-0`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.5 + (index * 0.1), duration: 0.5 }}
              style={{
                width: nodeDimensions.input.width,
                height: nodeDimensions.input.height,
                top: nodePositions[node.id].cy - nodeDimensions.input.height / 2,
                left: nodePositions[node.id].cx - nodeDimensions.input.width / 2,
              }}
            >
              <node.icon className="w-4 h-4" />
              {node.label} +
            </motion.div>
          ))}

          {/* Nó da IA */}
          <motion.div
            className="absolute rounded-full flex items-center justify-center z-10 overflow-hidden"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 2.8, duration: 0.8 }}
            style={{
                top: nodePositions.ai.cy - nodeDimensions.ai.height / 2,
                left: nodePositions.ai.cx - nodeDimensions.ai.width / 2,
                width: nodeDimensions.ai.width,
                height: nodeDimensions.ai.height,
                background: 'radial-gradient(circle at center, rgba(100, 100, 150, 0.9), rgba(50, 50, 100, 0.7), rgba(0, 0, 0, 0.9))',
                boxShadow: '0 0 20px rgba(100, 100, 150, 0.7)',
            }}
          >
            {/* SVG para as linhas internas curvadas e as linhas saindo */}
            <svg className="absolute inset-0 w-full h-full" viewBox={`0 0 ${nodeDimensions.ai.width} ${nodeDimensions.ai.height}`}>
              {/* Círculos concêntricos (para simular a esfera, opcional) */}
              <circle cx={nodeDimensions.ai.width / 2} cy={nodeDimensions.ai.height / 2} r={nodeDimensions.ai.radius * 0.9} stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.5" fill="none" />
              <circle cx={nodeDimensions.ai.width / 2} cy={nodeDimensions.ai.height / 2} r={nodeDimensions.ai.radius * 0.6} stroke="rgba(255, 255, 255, 0.15)" strokeWidth="0.5" fill="none" />

              {/* Linhas curvadas internas (simulando a grade da esfera) */}
              {/* Linha horizontal superior curvada */}
              <path d={`M0,${nodeDimensions.ai.height * 0.3} C${nodeDimensions.ai.width * 0.2},${nodeDimensions.ai.height * 0.25} ${nodeDimensions.ai.width * 0.8},${nodeDimensions.ai.height * 0.25} ${nodeDimensions.ai.width},${nodeDimensions.ai.height * 0.3}`}
                    stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" fill="none" />
              {/* Linha horizontal central curvada (menos curva, mais reta) */}
              <path d={`M0,${nodeDimensions.ai.height * 0.5} C${nodeDimensions.ai.width * 0.2},${nodeDimensions.ai.height * 0.5} ${nodeDimensions.ai.width * 0.8},${nodeDimensions.ai.height * 0.5} ${nodeDimensions.ai.width},${nodeDimensions.ai.height * 0.5}`}
                    stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" fill="none" />
              {/* Linha horizontal inferior curvada */}
              <path d={`M0,${nodeDimensions.ai.height * 0.7} C${nodeDimensions.ai.width * 0.2},${nodeDimensions.ai.height * 0.75} ${nodeDimensions.ai.width * 0.8},${nodeDimensions.ai.height * 0.75} ${nodeDimensions.ai.width},${nodeDimensions.ai.height * 0.7}`}
                    stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" fill="none" />

              {/* Linhas verticais curvadas (para dar profundidade) */}
              {/* Linha vertical esquerda */}
              <path d={`M${nodeDimensions.ai.width * 0.3},0 C${nodeDimensions.ai.width * 0.25},${nodeDimensions.ai.height * 0.2} ${nodeDimensions.ai.width * 0.25},${nodeDimensions.ai.height * 0.8} ${nodeDimensions.ai.width * 0.3},${nodeDimensions.ai.height}`}
                    stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" fill="none" />
              {/* Linha vertical central */}
              <path d={`M${nodeDimensions.ai.width * 0.5},0 C${nodeDimensions.ai.width * 0.5},${nodeDimensions.ai.height * 0.2} ${nodeDimensions.ai.width * 0.5},${nodeDimensions.ai.height * 0.8} ${nodeDimensions.ai.width * 0.5},${nodeDimensions.ai.height}`}
                    stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" fill="none" />
              {/* Linha vertical direita */}
              <path d={`M${nodeDimensions.ai.width * 0.7},0 C${nodeDimensions.ai.width * 0.75},${nodeDimensions.ai.height * 0.2} ${nodeDimensions.ai.width * 0.75},${nodeDimensions.ai.height * 0.8} ${nodeDimensions.ai.width * 0.7},${nodeDimensions.ai.height}`}
                    stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" fill="none" />

              {/* Linhas saindo da esfera (mais realistas, com gradiente para transparente) */}
              {/* Linha inferior central (principal) */}
              <path d={`M${nodeDimensions.ai.width / 2},${nodeDimensions.ai.height} C${nodeDimensions.ai.width / 2},${nodeDimensions.ai.height + 20} ${nodeDimensions.ai.width * 0.45},${nodeDimensions.ai.height + 60} ${nodeDimensions.ai.width * 0.3},${nodeDimensions.ai.height + 80}`}
                    stroke="url(#lineGradient)" strokeWidth="1.5" fill="none" />
              <path d={`M${nodeDimensions.ai.width / 2},${nodeDimensions.ai.height} C${nodeDimensions.ai.width / 2},${nodeDimensions.ai.height + 20} ${nodeDimensions.ai.width * 0.55},${nodeDimensions.ai.height + 60} ${nodeDimensions.ai.width * 0.7},${nodeDimensions.ai.height + 80}`}
                    stroke="url(#lineGradient)" strokeWidth="1.5" fill="none" />

              {/* Linhas superiores (saindo para cima) */}
              <path d={`M${nodeDimensions.ai.width * 0.4},0 C${nodeDimensions.ai.width * 0.4},-10 ${nodeDimensions.ai.width * 0.3},-30 ${nodeDimensions.ai.width * 0.2},-50`}
                    stroke="url(#lineGradient)" strokeWidth="1" fill="none" />
              <path d={`M${nodeDimensions.ai.width * 0.6},0 C${nodeDimensions.ai.width * 0.6},-10 ${nodeDimensions.ai.width * 0.7},-30 ${nodeDimensions.ai.width * 0.8},-50`}
                    stroke="url(#lineGradient)" strokeWidth="1" fill="none" />

              {/* Linhas laterais (saindo para os lados) */}
              <path d={`M0,${nodeDimensions.ai.height * 0.5} C-10,${nodeDimensions.ai.height * 0.5} -30,${nodeDimensions.ai.height * 0.4} -50,${nodeDimensions.ai.height * 0.3}`}
                    stroke="url(#lineGradient)" strokeWidth="1" fill="none" />
              <path d={`M${nodeDimensions.ai.width},${nodeDimensions.ai.height * 0.5} C${nodeDimensions.ai.width + 10},${nodeDimensions.ai.height * 0.5} ${nodeDimensions.ai.width + 30},${nodeDimensions.ai.height * 0.6} ${nodeDimensions.ai.width + 50},${nodeDimensions.ai.height * 0.7}`}
                    stroke="url(#lineGradient)" strokeWidth="1" fill="none" />

              {/* Definição do gradiente para as linhas que saem */}
              <defs>
                <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
              </defs>
            </svg>
            {/* Texto "AI" com brilho e possível contorno */}
            <span
              className="text-white text-3xl font-bold relative z-20"
              style={{
                textShadow: '0 0 5px rgba(255,255,255,0.8), 0 0 10px rgba(255,255,255,0.6)',
                // Para um contorno mais similar à imagem, você pode tentar (mas pode variar entre navegadores):
                // WebkitTextStroke: '0.8px white',
                // color: 'transparent', // Se usar WebkitTextStroke, defina a cor do texto como transparente
              }}
            >
              AI
            </span>
          </motion.div>

          {/* NOVOS NÓS DE SAÍDA COM POSICIONAMENTO SIMPLIFICADO */}
          {outputNodes.map((node, index) => (
            <motion.div
              key={node.id}
              className={`absolute pt-8 pb-4 px-4 rounded-xl shadow-lg bg-white text-black flex flex-col items-center gap-2 text-lg text-center opacity-0`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 3.5 + (index * 0.2), duration: 0.5 }}
              style={{
                width: nodeDimensions.output.width,
                height: nodeDimensions.output.height,
                // Posiciona o elemento HTML usando as mesmas coordenadas de centro que o SVG
                top: nodePositions[node.id].cy - nodeDimensions.output.height / 2,
                left: nodePositions[node.id].cx - nodeDimensions.output.width / 2,
              }}
            >
              <node.icon className="w-8 h-8 mb-2" />
              <span className="font-semibold text-black">{node.label}</span>
              <p className="text-sm text-gray-600">{node.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* As seções seguintes permanecem iguais */}
<section id="vantagens" className="bg-slate-800 py-40 px-8"> {/* Reduzido py-60 para py-40 */}
        <h3 className="text-4xl font-bold text-center mb-32 text-white">Multiplique sua Carteira de Clientes!</h3> {/* Novo título */}

        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-12">
          {/* Gráfico de Crescimento Central (SVG) */}
          <div className="w-full max-w-7xl bg-slate-700 p-8 rounded-xl shadow-lg relative overflow-hidden">
            <h4 className="text-2xl font-semibold text-center text-white mb-6">Seu Crescimento Acelerado</h4>
            <svg className="w-full h-48" viewBox="0 0 400 200" preserveAspectRatio="xMidYMid meet">
              {/* Linha base */}
              <line x1="50" y1="180" x2="350" y2="180" stroke="#4B5563" strokeWidth="2" />
              {/* Linha vertical esquerda (X) */}
              <line x1="50" y1="180" x2="50" y2="100" stroke="#4B5563" strokeWidth="2" />
              {/* Linha vertical direita (2X) */}
              <line x1="350" y1="180" x2="350" y2="20" stroke="#4B5563" strokeWidth="2" />

              {/* Linha de Crescimento (curva ascendente) */}
              <motion.path
                d="M50 180 C 150 100, 250 50, 350 20" // Ajuste os pontos de controle para a curvatura desejada
                stroke="#6366F1" // Cor índigo
                strokeWidth="4"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />

              {/* Pontos X e 2X */}
              <circle cx="50" cy="180" r="6" fill="#6366F1" />
              <text x="40" y="195" fill="#E2E8F0" fontSize="18" fontWeight="bold" textAnchor="end">X</text>

              <circle cx="350" cy="20" r="6" fill="#6366F1" />
              <text x="360" y="15" fill="#E2E8F0" fontSize="18" fontWeight="bold" textAnchor="start">2X</text>

              {/* Eixo Y (Crescimento) */}
              <text x="20" y="20" fill="#9CA3AF" fontSize="14" textAnchor="middle" transform="rotate(-90 20 20)">Crescimento de Clientes</text>
              {/* Eixo X (Tempo ou Ação) */}
              <text x="200" y="195" fill="#9CA3AF" fontSize="14" textAnchor="middle">Com Vendas em Escala</text>
            </svg>
            <p className="text-slate-300 text-center mt-4 text-lg">
              Com a nossa IA, transforme sua carteira de clientes de **X** para **2X** ou mais!
            </p>
          </div>

          {/* Pontos-Chave Abaixo do Gráfico */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mt-8">
            <div className="bg-slate-700 p-6 rounded-xl shadow text-center">
              <h4 className="text-xl font-semibold text-white mb-3">Geração de Leads Qualificados</h4>
              <p className="text-slate-300">Nossa IA encontra novos leads com alta probabilidade de conversão para a sua empresa.</p>
            </div>
            <div className="bg-slate-700 p-6 rounded-xl shadow text-center">
              <h4 className="text-xl font-semibold text-white mb-3">Otimização da Força de Vendas</h4>
              <p className="text-slate-300">Sua equipe foca em fechar negócios, enquanto a IA faz o trabalho pesado de prospecção.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="beneficios" className="bg-slate-900 py-20 px-8">
        <h3 className="text-4xl font-bold text-center mb-16">Benefícios para sua empresa</h3>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {[
            'Análise Humana + IA',
            'Reuniões periódicas para refinamento',
            'Geração de Leads na região que desejar',
            'Mais de 20 informações úteis por CNPJ',
            'Mapas de Oportunidades + Planilha',
            'Integração com CRMs',
          ].map((benefit, i) => (
            <div key={i} className="bg-slate-800 p-6 rounded-xl shadow hover:shadow-xl transition">
              <p className="text-indigo-400 font-semibold mb-2">✔</p>
              <p>{benefit}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="diferenciais" className="bg-indigo-800 py-20 px-8">
        <h3 className="text-4xl font-bold text-center mb-12">Por que escolher o VENDAS EM ESCALA?</h3>
        <div className="max-w-4xl mx-auto text-center text-lg text-indigo-100 space-y-6">
          <p>🔍 IA própria treinada com dados empresariais reais</p>
          <p>📊 Base com mais de 65 milhões de empresas</p>
          <p>🔥 Leads “quentes” prontos para ação comercial</p>
        </div>
      </section>

      <section className="bg-slate-800 py-20 px-8 text-center">
        <h4 className="text-3xl font-bold mb-4">Pronto para aumentar suas vendas?</h4>
        <p className="text-slate-300 mb-6">Crie sua conta agora mesmo e comece a gerar leads qualificados.</p>
        <button className="bg-indigo-500 hover:bg-indigo-400 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg transition">
          Criar Conta
        </button>
      </section>

      <footer className="bg-slate-900 py-8 text-center text-slate-500 text-sm">
        © 2025 VENDAS EM ESCALA. Todos os direitos reservados.
      </footer>
    </main>
  );
}
