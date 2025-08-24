import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Filter, Search } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import HistoryCard, { HistoryItem as BaseHistoryItem } from '../components/HistoryCard';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';


type ChatMessage = { sender: 'user' | 'ai'; text: string; createdAt?: string };
type FullHistoryItem = BaseHistoryItem & { fileUrl: string };

const DashboardPage: React.FC = () => {
  const [historyItems, setHistoryItems] = useState<FullHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [aiSummary, setAISummary] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isAISummaryLoading, setIsAISummaryLoading] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatAnswer, setChatAnswer] = useState<string | null>(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [showChatBox, setShowChatBox] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "ai", text: string }[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(() => {
    return localStorage.getItem("ai-chat-fileId") || null;
  });
  const [chartCount, setChartCount] = useState(0);


  const { user, authFetch } = useAuth();

  const chartImages = [
    'https://tse3.mm.bing.net/th?id=OIP._549d-zwPHydvwsZi-vspAHaHa&pid=Api&P=0&h=220',
    'https://cdn3.vectorstock.com/i/1000x1000/81/47/3d-pie-chart-vector-1068147.jpg',
    'https://tse4.mm.bing.net/th?id=OIP.DA-QYwjqq4vmSVwJH8X59wHaEz&pid=Api&P=0&h=220',
    'https://tse3.mm.bing.net/th?id=OIP.q1yBDrglA9cvlCvFerBxFwHaD_&pid=Api&P=0&h=220',
    'https://tse1.mm.bing.net/th?id=OIP.EBUY-CEvJIGfqw2d6RVt0gHaEK&pid=Api&P=0&h=220',
  ];

  const getRandomPreview = () =>
    chartImages[Math.floor(Math.random() * chartImages.length)];

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const response = await authFetch('/api/excel/files');
        const files = response.files;

   const formatted: FullHistoryItem[] = files.map((file: any) => ({
  id: file._id,
  filename: file.filename,
  uploadDate: file.uploadDate,
  chartType: file.sheetName || 'Not specified',
  previewUrl: getRandomPreview(),
  fileUrl: file.fileUrl || file.url || '',
}));


        setHistoryItems(formatted);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  useEffect(() => {
    if (selectedFileId) {
      localStorage.setItem("ai-chat-fileId", selectedFileId);
    }
  }, [selectedFileId]);

  const generateAIInsights = async (fileId: string) => {
    const file = historyItems.find((f) => f.id === fileId);
    if (!file?.fileUrl) {
      alert('❌ Missing file URL');
      return;
    }

    setIsAISummaryLoading(true);
    setShowModal(true);

    try {
      const data = await authFetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: file.fileUrl }),
      });

      if (data.success) {
        setAISummary(data.summary);
      } else {
        setAISummary('❌ AI Summary failed: ' + data.message);
      }
    } catch (err: any) {
      console.error('AI request error:', err);
      setAISummary(
        err?.message?.includes('quota')
          ? '🚫 OpenAI quota exceeded. Please check billing.'
          : 'Error calling AI summary.'
      );
    } finally {
      setIsAISummaryLoading(false);
    }
  };

  const handleAIChat = async (fileId: string) => {
    const file = historyItems.find((f) => f.id === fileId);
    if (!file?.fileUrl) return alert("Missing file URL");

    setChatModalOpen(true);
    setChatAnswer(null);

    const ask = prompt("Enter your question for the AI:");
    if (!ask) return;

    setChatLoading(true);
    try {
      const res = await authFetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: file.fileUrl,
          question: ask,
        }),
      });

      if (res.success) setChatAnswer(res.answer);
      else setChatAnswer("❌ Failed: " + res.message);
    } catch (e) {
      setChatAnswer("Error contacting AI");
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    const loadChat = async () => {
      if (!selectedFileId) return;
      try {
        const res = await authFetch(`/api/chat/${selectedFileId}`);
        if (res.success) setChatMessages(res.messages);
        else console.error('Chat load failed:', res.message);
      } catch (err) {
        console.error('Error loading chat history', err);
      }
    };
    loadChat();
  }, [selectedFileId]);

  const handleChatSend = async () => {
    const question = chatInput.trim();
    if (!question || !selectedFileId) return;

    const file = historyItems.find((f) => f.id === selectedFileId);
    if (!file?.fileUrl) {
      alert('❌ Missing file URL for selected file');
      return;
    }

    const newMsg: ChatMessage = { sender: 'user', text: question };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      // Save user message
      await authFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: selectedFileId,
          sender: 'user',
          text: question
        }),
      });

      // Get AI response using fileUrl instead of fileId
      const res = await authFetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileUrl: file.fileUrl,
          question: question
        }),
      });

      const aiMsg: ChatMessage = {
        sender: 'ai',
        text: res.success ? res.answer : '❌ Failed: ' + res.message,
      };

      setChatMessages((prev) => [...prev, aiMsg]);

      // Save AI message
      await authFetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: selectedFileId,
          sender: 'ai',
          text: aiMsg.text
        }),
      });
    } catch (err) {
      console.error('Chat error:', err);
      setChatMessages((prev) => [...prev, { sender: 'ai', text: '🚫 Error contacting AI.' }]);
    } finally {
      setChatLoading(false);
    }
  };
  const handleClearChat = () => {
    if (!selectedFileId) return;

    toast(
      (t) => (
        <div className="p-3 text-sm">
          <p className="mb-2">Are you sure you want to clear the chat?</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  const res = await authFetch(`/api/chat/${selectedFileId}`, {
                    method: 'DELETE',
                  });

                  if (res.success) {
                    setChatMessages([]);
                    toast.success('🧹 Chat cleared successfully!');
                  } else {
                    toast.error('❌ Failed to clear chat.');
                  }
                } catch (err) {
                  console.error('Clear chat error:', err);
                  toast.error('🚫 Something went wrong while clearing chat.');
                }
              }}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Yes, clear
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 bg-gray-200 text-black rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: 10000,
      }
    );
  };

  useEffect(() => {
    const fetchChartCount = async () => {
      try {
        const res = await fetch('/api/analytics/chart-count', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setChartCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching chart count:', error);
      }
    };

    fetchChartCount();
  }, []);



  return (
    <div className="container mx-auto max-w-7xl px-4 pt-24 pb-16 bg-emerald-50 dark:bg-gray-900">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/upload">
            <Button className="flex items-center">
              <Upload size={16} className="mr-1" /> Upload File
            </Button>
          </Link>
          <div className="relative">
            <select
              value={selectedFileId || ''}
              onChange={(e) => setSelectedFileId(e.target.value)}
              className="px-3 py-2 rounded-md border border-purple-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 hover:border-purple-700 transition"
            >
              <option value="" disabled>Select File for AI</option>
              {historyItems.map((item) => (
              <option key={item.id} value={item.id}>{item.filename}</option> 
              ))}
            </select>
          </div>

          <Button
            className="px-4 py-2 font-semibold rounded-md bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600 transition"
            onClick={() => {
              if (selectedFileId) {
                setShowChatBox((prev) => !prev);
              } else {
                alert('Please select a file for AI chat.');
              }
            }}
          >
            💬 Chat with AI
          </Button>

        </div>
      </div>

      {showChatBox && selectedFileId && (
        <div className="fixed bottom-6 right-6 z-50 w-80 max-h-[80vh] bg-white dark:bg-gray-900 border rounded-lg shadow-xl flex flex-col">
          <div className="bg-purple-600 text-white px-4 py-2 flex justify-between items-center">
            <span>Chat with AI</span>
            <div className="space-x-2">
              <button
                onClick={handleClearChat}
                title="Clear Chat"
                className="text-xs bg-red-500 hover:bg-red-600 px-2 py-1 rounded"
              >
                🗑️ Clear
              </button>
              <button onClick={() => setShowChatBox(false)} title="Close Chat">
                ✖
              </button>
            </div>
          </div>

          <div className="p-3 flex-1 overflow-y-auto text-sm space-y-2 bg-gray-50 dark:bg-gray-800">
            {chatMessages.length === 0 ? (
              <div className="text-gray-500 dark:text-gray-400">Start a conversation about your file.</div>
            ) : (
              chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2 rounded text-sm whitespace-pre-line ${msg.sender === 'user'
                    ? 'bg-blue-100 dark:bg-blue-800 text-right text-blue-900 dark:text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                >
                  <div className="text-xs font-medium mb-1">{msg.sender === 'user' ? 'You' : 'AI'}</div>
                  {msg.text}
                </div>
              ))
            )}
            {chatLoading && <div className="text-purple-600 animate-pulse">AI is thinking...</div>}
          </div>

          <div className="flex border-t">
            <input
              type="text"
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-900 dark:text-white"
              placeholder="Ask your question..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
            />
            <button
              className="px-4 text-purple-600 font-medium"
              onClick={handleChatSend}
              disabled={chatLoading}
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Card className="p-6 dark:bg-gray-800 dark:text-white">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Files</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{historyItems.length}</h3>
            <p className="text-xs text-green-600 flex items-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="m18 15-6-6-6 6" />
              </svg>
              <span>+2 this week</span>
            </p>
          </div>
        </Card>

        <Card className="p-6 dark:bg-gray-800 dark:text-white">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Charts Created</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{chartCount}</h3>
            <p className="text-xs text-green-600 flex items-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="m18 15-6-6-6 6" />
              </svg>
              <span>{chartCount > 0 ? `+${chartCount} total` : '+0'}</span>
            </p>
          </div>
        </Card>

        <Card className="p-6 dark:bg-gray-800 dark:text-white">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Storage Used</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">32.4 MB</h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">of 1 GB</p>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
              <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '3.24%' }}></div>
            </div>
          </div>
        </Card>

        <Card className="p-6 dark:bg-gray-800 dark:text-white">
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
            <h3 className="text-3xl font-bold text-gray-900 dark:text-white">Free</h3>
            <Link to="/upgrade" className="text-xs text-blue-600 hover:text-blue-800 dark:hover:text-blue-400">
              Upgrade to Pro
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Uploads */}
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 md:mb-0">Recent Uploads</h2>
          <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search files..." className="pl-10 pr-4 py-2 w-full md:w-60 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <Button variant="outline" className="flex items-center">
              <Filter size={16} className="mr-1" />
              <span>Filter</span>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : historyItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {historyItems.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onDelete={(id) => setHistoryItems((prev) => prev.filter((f) => f.id !== id))}
                onAISummary={(fileId) => generateAIInsights(fileId)}
                onAIChat={(fileId) => handleAIChat(fileId)}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center dark:bg-gray-800">
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mb-4">
                <Upload size={24} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Files Yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Upload your first Excel file to start creating beautiful visualizations.
              </p>
              <Link to="/upload">
                <Button>Upload File</Button>
              </Link>
            </div>
          </Card>
        )}
      </div>

      {/* AI Summary Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">📊 AI Summary</h2>
            <div className="max-h-80 overflow-y-auto text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-6">
              {isAISummaryLoading ? (
                <div className="flex items-center justify-center text-blue-600 h-24">
                  <svg className="animate-spin h-6 w-6 mr-2" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Preparing summary...
                </div>
              ) : (
                aiSummary
              )}
            </div>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={() => {
                  setShowModal(false);
                  setAISummary(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Chat Modal */}
      {chatModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">🤖 Ask AI About Your Data</h2>
            <input
              type="text"
              placeholder="Enter your question..."
              className="w-full px-4 py-2 mb-4 rounded border dark:bg-gray-700 dark:text-white border-gray-300 focus:ring focus:ring-blue-500"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
            />
            <div className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap mb-6">
              {chatLoading ? "Thinking..." : chatAnswer}
            </div>
            <div className="flex justify-between gap-2">
              <button
                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded hover:bg-gray-400"
                onClick={() => {
                  setChatModalOpen(false);
                  setChatAnswer(null);
                  setChatInput("");
                }}
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                onClick={async () => {
                  if (!chatInput.trim()) return;
                  setChatLoading(true);
                  try {
                    const latestFile = historyItems[0];
                    if (!latestFile?.fileUrl) {
                      setChatAnswer("❌ No recent file found.");
                    } else {
                      const res = await authFetch('/api/ai/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ fileUrl: latestFile.fileUrl, question: chatInput }),
                      });
                      setChatAnswer(res.success ? res.answer : "❌ Failed: " + res.message);
                    }
                  } catch (err) {
                    setChatAnswer("🚫 Error contacting AI");
                  } finally {
                    setChatLoading(false);
                  }
                }}
              >
                Ask AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;