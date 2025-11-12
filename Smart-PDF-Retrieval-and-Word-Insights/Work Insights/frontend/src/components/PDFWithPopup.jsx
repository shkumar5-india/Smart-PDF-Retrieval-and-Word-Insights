
import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import {
  Menu, Minus, Plus, RotateCcw, Undo2, Redo2, Upload, Bot, PenLine, X, ScanLine,
  Volume2, ClipboardCopy, ChevronDown, ChevronUp, Search,
} from "lucide-react";
import axios from 'axios';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';


pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDFWithPopup = ({ file, handleFileChange }) => {
  const [data, setData] = useState({});
  const [selectedWord, setSelectedWord] = useState(null);
  const [targeted_language, setTargeted_language] = useState("Telugu");
  const [selectedApi, setSelectedApi] = useState("llama"); 

  const containerRef = useRef(null);
  const [popup, setPopup] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [scale, setScale] = useState(1.4);

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));
  

  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [showBotPanel, setShowBotPanel] = useState(false);

  const copyToClipboard = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } else {
      alert('Nothing to copy!');
    }
  };

  const playAudio = (url) => {
    if (url) {
      const audio = new Audio(url);
      audio.play().catch(e => console.error("Error playing audio:", e));
    } else {
      alert("No audio URL available for this word/translation.");
    }
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  
  const fetchData = async (word, apiProvider) => {
    setData({}); 
    setShowDetails(false); 
    setIsLoading(true); 
    setSelectedWord(word); 

    try {
      
      const res = await axios.get(`http://127.0.0.1:5000/dict/?word=${word}&targeted_language=${targeted_language}&api_provider=${apiProvider}`);
      setData(res.data);
      console.log("Fetched data:", res.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setData({}); // Clear data on error
      alert(`Failed to fetch data for "${word}" from ${apiProvider}. Check console for details.`);
    } finally {
      setIsLoading(false); 
    }
  };

  const handleDoubleClick = (pageNumber) => (e) => {
    const textSpan = e.target.closest(".textLayer span");
    if (!textSpan) {
      setPopup(null); 
      return;
    }

    const selectedText = window.getSelection().toString().trim();
    if (!selectedText) {
      setPopup(null); 
      return;
    }
    console.log("Selected text:", selectedText);

    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();

    
    const x = e.clientX - containerRect.left + container.scrollLeft;
    const y = e.clientY - containerRect.top + container.scrollTop;

  
    fetchData(selectedText, selectedApi);
    setPopup({ x, y, pageNumber });
  };

  const textareaRef = useRef(null);

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;

    el.style.height = 'auto'; 
    const scrollHeight = el.scrollHeight;
    const maxHeight = window.innerHeight * 0.2; 

    el.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
    el.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
  };

  useEffect(() => {
    handleInput(); 
  }, []);

  return (
    <div className='fixed top-0 w-screen'>
      <div className="flex h-screen w-screen bg-[#3C4043]">
        <div className='flex flex-col flex-1 overflow-auto'>
          {/* Toolbar sticky top-0 z-10 */}
          <div className="sticky top-0 z-10 flex items-center justify-between bg-[#3C4043] text-white px-4 py-1 text-sm">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <button className="p-4 hover:bg-gray-700 rounded">
                <Menu className="w-5 h-5" />
              </button>
              <span className="font-medium">
                {file ? file.name.split(".")[0] : "No File Selected"}
              </span>
            </div>

            {/* Middle controls */}
            <div className="flex items-center gap-2">
              <span className="bg-gray-900 px-2 py-1 rounded">1</span>
              <span>/</span>
              <span>{numPages || 0}</span> 
              <div className="h-5 border-l border-gray-600 mx-1" />

              <button onClick={zoomOut} className="p-3 hover:bg-[#5F6368] rounded-full">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-[46px] focus:border-none bg-gray-900 p-1 rounded">{Math.round((scale * 100) - 20) + " %"}</span>
              <button onClick={zoomIn} className="p-3 hover:bg-[#5F6368] rounded-full">
                <Plus className="w-4 h-4" />
              </button>

              <div className="h-5 border-l border-gray-600 mx-2" />
              <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-[#2A2A2E] text-sm text-gray-300 border border-gray-600 shadow-sm">
                <ScanLine className="w-4 h-4 text-sky-400 animate-spin-slow" />
                <span className="tracking-wide">Extracting...</span>
                <div className="relative ml-auto">
                  <span className="flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500"></span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <button
                className="p-2 hover:bg-[#5F6368] rounded cursor-pointer"
                title='Import PDF'
              >
                <label htmlFor="file-upload"><Upload className="w-5 h-5 cursor-pointer" /></label>
                <input
                  type="file"
                  accept="application/pdf"
                  name='file-upload'
                  id='file-upload'
                  onChange={handleFileChange}
                  className="border border-gray-300 p-2 rounded hidden"
                />
              </button>
              <button
                className="p-2 hover:bg-[#5F6368] rounded cursor-pointer"
                onClick={() => setShowBotPanel((prev) => !prev)}
                title='Open Bot Panel'
              >
                <Bot className="w-6 h-6" />
              </button>
            </div>
          </div>
          {/* PDF Viewer */}
          <div
            ref={containerRef}
            className="flex-1 overflow-auto bg-[#2A2A2E] px-4 py-6 relative"
          >
            {file ? (
              <Document file={file} onLoadSuccess={onDocumentLoadSuccess}>
                {Array.from({ length: numPages || 0 }, (_, i) => (
                  <div
                    key={i}
                    onDoubleClick={handleDoubleClick(i + 1)}
                    className="mb-4 mx-auto shadow w-fit"
                  >
                    <Page pageNumber={i + 1} scale={scale} />
                  </div>
                ))}
              </Document>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-xl">
                Please upload a PDF to view.
              </div>
            )}


            {/* Popup */}
            {popup && (
              <div
                className="absolute z-50 bg-white border border-gray-300 shadow-xl rounded-lg p-4 w-[30vw]"
                style={{ left: popup.x, top: popup.y }}
              >
                {isLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    <p className="ml-3 text-gray-700">Loading data from {selectedApi}...</p>
                  </div>
                ) : Object.keys(data).length > 0 && data.definition && data.definition.length > 0 ? ( // Ensure data and definition exist and is not empty
                  <>
                    {/* Header */}
                    <div className="flex justify-between items-center border-b pb-2 ">
                      <div className='relative flex gap-1'>
                        <h4 className="text-3xl font-semibold text-gray-800">{selectedWord}</h4>
                        <p className="relative top-5 text-xs text-gray-500 capitalize">{data.definition?.[0]?.part_of_speech?.[0]}</p>
                      </div>
                      <div className='flex items-center gap-4'>
                        {/* API Provider Dropdown */}
                        <select
                          value={selectedApi}
                          onChange={(e) => {
                            setSelectedApi(e.target.value);
                            if (selectedWord) { 
                              fetchData(selectedWord, e.target.value);
                            }
                          }}
                          className="bg-gray-100 border border-gray-300 text-gray-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-1.5"
                        >
                          <option value="llama">llama</option>
                          <option value="qwen">Qwen</option>
                          <option value="openAI">OpenAI</option>
                          {/* <option value="DeepSeek">DeepSeek</option> */}
                        </select>

                        <button
                          onClick={() => copyToClipboard(data.definition?.[0]?.meaning || '')}
                          className="flex items-center text-xl text-zinc-700 hover:text-zinc-800 cursor-pointer"
                          title="Copy definition"
                        >
                          <ClipboardCopy size={16} className="mr-1" />
                        </button>
                        <button
                          onClick={() => setPopup(null)}
                          className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
                          aria-label="Close"
                          title="Close popup"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>

                    {/* Main Info */}
                    <div className="text-sm text-gray-700 space-y-2 mt-2">
                      {data.definition?.[0]?.meaning && (
                        <div>
                          <strong>Definition:</strong> {data.definition[0].meaning}
                        </div>
                      )}

                      {data.definition?.[0]?.contextual_meaning && (
                        <div>
                          <strong>Context:</strong> {data.definition[0].contextual_meaning}
                        </div>
                      )}

                      {data.pronunciation?.phonetic && (
                        <div className="flex items-center">
                          <strong>Pronunciation:</strong>&nbsp;{data.pronunciation.phonetic}
                          <button
                            onClick={() => playAudio(data.interactive_elements?.audio_button?.url)}
                            className="ml-2 text-blue-500 hover:text-blue-700"
                            aria-label="Play pronunciation"
                            title="Play pronunciation"
                          >
                            <Volume2 size={16} />
                          </button>
                        </div>
                      )}

                      {data.translation?.translated_word && (
                        <div className="flex items-center">
                          <strong>Telugu:</strong>&nbsp;
                          {data.translation.translated_word} ({data.translation.pronunciation?.phonetic})
                          <button
                            onClick={() => playAudio(data.interactive_elements?.translation_audio_button?.url)}
                            className="ml-2 text-blue-500 hover:text-blue-700"
                            aria-label="Play Telugu pronunciation"
                            title="Play Telugu pronunciation"
                          >
                            <Volume2 size={16} />
                          </button>
                        </div>
                      )}

                      {data.translation?.contextual_sentence && (
                        <div>
                          <strong>Telugu Sentence:</strong> {data.translation.contextual_sentence}
                        </div>
                      )}
                    </div>

                    {/* Toggle Details */}
                    <button
                      onClick={() => setShowDetails(!showDetails)}
                      className="w-full mt-3 flex justify-end items-center text-xs font-bold text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                    >
                      <span className="ml-1">{showDetails ? 'Hide Details' : 'Show More Details'}</span>
                      {showDetails ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>

                    {/* Expanded Details */}
                    {showDetails && (
                      <div className="mt-3 text-sm text-gray-700 space-y-2 border-t pt-3">
                        {data.etymology && (
                          <div>
                            <strong>Etymology:</strong> {data.etymology}
                          </div>
                        )}

                        {data.synonyms?.length > 0 && (
                          <div>
                            <strong>Synonyms:</strong> {data.synonyms.join(', ')}
                          </div>
                        )}

                        {data.antonyms?.length > 0 && (
                          <div>
                            <strong>Antonyms:</strong> {data.antonyms.join(', ')}
                          </div>
                        )}

                        {data.example_sentences?.length > 0 && (
                          <div>
                            <strong>Examples:</strong>
                            <ul className="list-disc list-inside text-gray-600">
                              {data.example_sentences.map((sentence, index) => (
                                <li key={index}>{sentence}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {data.related_words?.[0]?.word && (
                          <div className="flex items-center gap-1">
                            <strong>Related Word:</strong> {data.related_words[0].word}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    No data available for "{selectedWord}" from {selectedApi}.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div>
          {showBotPanel && (
            <div className="w-[450px] h-screen flex flex-col bg-[#1F1F23] text-[#5F6368] shadow-lg z-10 py-4">
              <div className="flex justify-between items-center mx-4 mb-4 flex-shrink-0">
                <h2 className="text-lg font-semibold">Bot Assistant</h2>
                <button
                  onClick={() => setShowBotPanel(false)}
                  className="text-gray-400 hover:text-red-500 cursor-pointer"
                  aria-label="Close Panel"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable content area */}
              <div className="flex-grow overflow-y-auto px-4">
                <div className="container px-4 py-2 space-y-4 max-w-md mx-auto">
                  {/* Human message */}
                  <div className="flex justify-end">
                    <div className="bg-[#1F2937] text-[#D1D5DB] px-4 py-2 rounded-lg rounded-br-none max-w-xs break-words">
                      Hi! How can I help you today?
                    </div>
                  </div>

                  {/* AI message */}
                  <div className="flex justify-start">
                    <div className="bg-[#111827] text-[#F3F4F6] px-4 py-2 rounded-lg rounded-bl-none max-w-xs break-words">
                      Hello! I’m your assistant. Ask me anything.
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-[#1F2937] text-[#D1D5DB] px-4 py-2 rounded-lg rounded-br-none max-w-xs break-words">
                      Can you tell me a joke?
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="bg-[#111827] text-[#F3F4F6] px-4 py-2 rounded-lg rounded-bl-none max-w-xs break-words">
                      Sure! Why don’t scientists trust atoms? Because they make up everything!
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-amber-600 text-[#F3F4F6] px-4 py-2 rounded-lg rounded-bl-none max-w-xs break-words">
                      Bot functionality hasn’t been developed yet.
                    </div>
                  </div>
                </div>
              </div>

              {/* Fixed input at bottom */}
              <div className="flex-shrink-0 bg-[#2A2A2E] text-[#9CA3AF] mx-2 px-4 py-3 rounded-t-xl border-t border-[#5F6368]">
                <textarea
                  ref={textareaRef}
                  onInput={handleInput}
                  rows={1}
                  className="w-full max-h-[20vh] px-2 text-lg placeholder-gray-400 bg-transparent border-0 focus:outline-none resize-none overflow-y-auto"
                  placeholder="How can I assist you?"
                ></textarea>

                <div className="flex mt-2">
                  <div className="bg-[#5F6368] p-2 rounded-xl cursor-pointer">
                    Workflow
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PDFWithPopup;