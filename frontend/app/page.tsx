"use client"

import { useState, useEffect, useRef } from "react"
import {
  Upload,
  Loader2,
  ChevronDown,
  MessageSquare,
  Code,
  Bug,
  AlertTriangle,
  TrendingUp,
  Briefcase,
  Scale,
  Beaker,
  FileSpreadsheet,
  RotateCcw,
  Send,
  ArrowLeft
} from "lucide-react"
import { cn } from "../lib/utils"
import { Space_Grotesk, Fira_Code, DotGothic16 } from 'next/font/google'
import CosmicBackground from "@/components/CosmicBackground"  // Add this import
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import StarField from "@/components/StarField"
import { askBackend } from "@/lib/api"

// Add font configurations at the top of your file
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
})

const dotGothic16 = DotGothic16({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dot-gothic',
})

// Mock data for demonstration
const mockSummaryData = {
  totalCases: 1247,
  averageSentiment: 0.65,
  highUrgencyCount: 89,
  processingTime: "2.3 minutes",
}

const mockEnrichedData = [
  {
    caseId: "CS-2024-001",
    summary: "Login issues with mobile app authentication",
    sentiment: "Negative",
    intent: "Technical Support",
    persona: "Mobile User",
    nextAction: "Escalate to Tech Team",
  },
  {
    caseId: "CS-2024-002",
    summary: "Billing inquiry about subscription upgrade",
    sentiment: "Neutral",
    intent: "Billing Support",
    persona: "Business Customer",
    nextAction: "Send Pricing Guide",
  },
  {
    caseId: "CS-2024-003",
    summary: "Feature request for dashboard customization",
    sentiment: "Positive",
    intent: "Feature Request",
    persona: "Power User",
    nextAction: "Add to Product Backlog",
  },
  {
    caseId: "CS-2024-004",
    summary: "Account deletion and data export request",
    sentiment: "Neutral",
    intent: "Account Management",
    persona: "Privacy Conscious",
    nextAction: "Process GDPR Request",
  },
  {
    caseId: "CS-2024-005",
    summary: "Integration setup assistance needed",
    sentiment: "Positive",
    intent: "Technical Support",
    persona: "Developer",
    nextAction: "Schedule Onboarding Call",
  },
]

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function Dashboard() {
  // Add scrollY state
  const [scrollY, setScrollY] = useState(0)

  // State declarations
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState("") // Add this line
  const [showChat, setShowChat] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [showChatInterface, setShowChatInterface] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [isEvalModalOpen, setIsEvalModalOpen] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleFileClick = () => {
    // Programmatically trigger file input click
    fileInputRef.current?.click()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx'))) {
      alert('Please select a valid file (.csv or .xlsx)')
      return
    }

    setIsUploading(true)
    setUploadedFileName(file.name)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/enrich-cases`, {
        method: "POST",
        body: formData,
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Server response:', response.status, errorText)
        throw new Error(`Upload failed: ${response.status}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "enriched_cases.csv"
      a.click()
      a.remove()

      setUploadComplete(true)
      setShowChatInterface(true)

    } catch (error: unknown) {
      const err = error as Error
      console.error('Upload error:', err.message)
      alert(`❌ Upload failed: ${err.message}`)
      setUploadedFileName("") // Clear filename on error
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmitFile = () => {
    if (uploadedFile && !isProcessing) {
      setShowChatInterface(true);
    }
  }

  const handleEnrichment = async () => {
    setIsProcessing(true)
    setProcessingProgress(0)

    // Simulate processing with progress updates
    const interval = setInterval(() => {
      setProcessingProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsProcessing(false)
          setShowResults(true)
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: currentMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage("");
    setIsStreaming(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: currentMessage }),
      });

      const data = await res.json();

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer || "No answer returned.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error(err);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: "Sorry, the QA engine failed to respond. Check the backend.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsStreaming(false);
    }
  }

  const handleClearChat = () => {
    setMessages([])
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      case "negative":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const handleQuery = async () => {
    const result = await askBackend("What's the urgency of case 500gK...");
    console.log(result);
  };

  if (showChatInterface) {
    return (
      <div className="relative min-h-screen bg-[#0f0f1a]">
        {/* Add Back Button */}
        <div className="absolute top-4 left-4 z-30">
          <Button
            onClick={() => {
              setShowChatInterface(false);
              setMessages([]);
              setUploadedFileName("");
            }}
            variant="ghost"
            className="text-white/70 hover:text-white flex items-center gap-2 hover:bg-transparent"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to the Hub
          </Button>
        </div>

        {/* Rest of your existing chat interface code */}
        <div className="relative z-20 container mx-auto p-6 h-[calc(100vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            {/* Left Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Ask About Your Cases</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    This assistant answers questions about the cases you uploaded. Ask about summary, urgency,
                    sentiment, or specific Case IDs: e.g. "What is the sentiment of case 500gK000006Z2FeQAK?" or "What is the urgency of case 500gK000006Z2FpQAK?".
                  </p>
                  <Button
                    onClick={handleClearChat}
                    variant="outline"
                    className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 rounded-lg"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear Chat
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-3">
              <Card className="bg-white/5 backdrop-blur-sm border-white/10 h-full flex flex-col rounded-xl">
                {/* Chat Messages */}
                <div className="flex-1 p-6 overflow-y-auto space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center space-y-3">
                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto" />
                        <p className="text-gray-400">Start a conversation about your cases</p>
                        <p className="text-sm text-gray-500">
                          Try asking: "What are the most urgent cases?" or "Show me negative sentiment cases"
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl px-4 py-3 ${message.role === "user"
                              ? "bg-gradient-to-r from-purple-500 to-violet-500 text-white"
                              : "bg-white/10 text-gray-200 border border-white/20"
                              }`}
                          >
                            <p className="text-sm leading-relaxed">{message.content}</p>
                            <p className="text-xs opacity-70 mt-2">{message.timestamp.toLocaleTimeString()}</p>
                          </div>
                        </div>
                      ))}
                      {isStreaming && (
                        <div className="flex justify-start">
                          <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Input Area */}
                <div className="border-t border-white/10 p-4">
                  <div className="flex space-x-3">
                    <Input
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Ask about your cases..."
                      className="flex-1 bg-white/10 border-white/20 text-white placeholder-gray-400 rounded-xl"
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!currentMessage.trim() || isStreaming}
                      className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white rounded-xl px-6"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[300vh] bg-[#0f0f1a]">
      <CosmicBackground scrollY={scrollY} />
      {/* <ScrollIndicator /> */}

      {/* Navigation Header */}
      <nav className="relative z-20 border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-start space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden">
                  <img src="/images/logo.png" alt="AI Tool Hub Logo" className="w-full h-full object-cover" />
                </div>
                <h1 className="text-xl font-bold text-white">Internal AI Tool Hub</h1>
              </div>

              <div className="flex items-center space-x-6">
                <DropdownMenu>
                  <DropdownMenuTrigger className="text-black opacity-50 opacity-45 opacity-40 opacity-100" asChild>
                    <Button
                      variant="ghost"
                      className="text-sm text-gray-300 p-0 h-auto hover:bg-transparent hover:text-gray-200"
                    >
                      Choose your team
                      <ChevronDown className="w-3 h-3 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-gray-900/95 backdrop-blur-sm border-white/20 text-white">
                    <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Support
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-transparent focus:bg-transparent cursor-default opacity-75">
                      <span className="text-[#8dfa91] text-xs font-medium">Coming Soon</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-transparent focus:bg-transparent cursor-default opacity-75">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Sales
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-transparent focus:bg-transparent cursor-default opacity-75">
                      <Briefcase className="w-4 h-4 mr-2" />
                      HR
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-transparent focus:bg-transparent cursor-default opacity-75">
                      <Scale className="w-4 h-4 mr-2" />
                      Legal
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-transparent focus:bg-transparent cursor-default opacity-75">
                      <Beaker className="w-4 h-4 mr-2" />
                      R&D
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex items-center space-x-6">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="text-sm text-gray-300 p-0 h-auto hover:bg-transparent hover:text-white transition-colors"
                      >
                        Choose your wand
                        <ChevronDown className="w-3 h-3 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-900/95 backdrop-blur-sm border-white/20 text-white">
                      <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10">
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Case Enricher (current)
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10">
                        <Code className="w-4 h-4 mr-2" />
                        Jira Copilot
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10">
                        <Bug className="w-4 h-4 mr-2" />
                        API Troubleshooter
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-white/10 focus:bg-white/10">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Critical Outage Copilot
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-20 container mx-auto p-6">
        <div className="grid grid-cols-1 gap-8">
          {/* Main Dashboard */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="space-y-6 pt-16">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight text-center">
                  Salesforce AI Case Enricher
                  <br />
                  <span className="text-[#8dfa91]">Easy. Secure. Fast</span>
                </h1>
                <p className="text-xl text-gray-300 max-w-2xl text-center mx-auto">
                  Upload and enrich customer support cases with advanced natural language processing and sentiment
                  analysis
                </p>
              </div>
            </div>

            {/* Upload Section */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10 hover:border-purple-500/30 transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="mx-auto w-20 h-20 bg-gradient-to-r from-emerald-500/20 to-green-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                    <Upload className="w-10 h-10 text-[#8dfa91]" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-white">Upload Spreadsheet</h3>
                    <p className="text-gray-400">Select your .CSV or .XLSX file containing support case comments</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <label htmlFor="file-upload">
                        <Button
                          onClick={handleFileClick}
                          disabled={isUploading}
                          className={cn(
                            "inline-flex items-center px-6 py-3 rounded-lg",
                            "bg-primary text-primary-foreground hover:bg-primary/90",
                            "cursor-pointer transition-colors",
                            isUploading && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {isUploading ? (
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          ) : (
                            <Upload className="h-5 w-5 mr-2" />
                          )}
                          {isUploading ? "Processing..." : "Choose File"}
                        </Button>
                      </label>
                    </div>
                    {uploadedFile && (
                      <>
                        <div className="text-emerald-400 font-medium flex items-center justify-center space-x-2">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                          <span>{uploadedFile.name} uploaded successfully</span>
                        </div>
                        <Button
                          onClick={handleSubmitFile}
                          className="bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600 text-white font-semibold px-8 py-3 rounded-xl"
                        >
                          Submit & Start Analysis
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Blog Section */}
            <Card className="bg-white/5 backdrop-blur-sm border-white/10">
              <CardHeader className="mb-8 mt-0 pt-14 pl-8">
                <CardTitle className="text-3xl md:text-4xl font-bold font-dot-gothic text-white leading-tight">
                  From Data Inferno to Enrichment Pipeline:
                </CardTitle>
                <CardDescription className="text-xl md:text-2xl font-bold font-dot-gothic text-gray-300 mt-6">
                  Enriching Salesforce Support Cases at Scale
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Featured Blog Post */}
                <div className="space-y-4">
                  <div className="aspect-video rounded-xl overflow-hidden border border-white/10">
                    <img
                      src="/images/mystical-cover.png"
                      alt="Mystical scene with hooded figures and glowing blue orb against cosmic background"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>By Noa Sasson - AI Engineer @ Sorceress.io</span>
                    <span>|</span>
                    <span>Jun 15, 2025</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30">Salesforce</Badge>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">Data Pipeline</Badge>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">AI</Badge>
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Validation</Badge>
                    <Badge
                      className="bg-coral-500/20 text-coral-300 border-coral-500/30"
                      style={{
                        backgroundColor: "rgba(255, 114, 118, 0.2)",
                        color: "rgb(255, 144, 148)",
                        borderColor: "rgba(255, 114, 118, 0.3)",
                      }}
                    >
                      Support
                    </Badge>
                  </div>
                </div>

                <Separator className="bg-white/10" />

                {/* Blog Content - Only Steps */}
                <div className="prose prose-sm max-w-none space-y-6">
                  <h4 className="font-semibold text-white text-lg">
                    Step 1: You Shall Not Pass
                    <br />
                    <span className="text-sm font-bold text-gray-300 italic">
                      (Well, Only If You Validate Your Data First)
                    </span>
                  </h4>

                  <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                    <p>
                      Every AI pipeline rests on assumptions. Some are formal: model capabilities, token limits, rate constraints. Others are just wishful thinking: the data will arrive clean, the schema will match what's on the whiteboard, and no surprises will spring from the underworld of legacy systems. This step was about vaporizing those illusions before they turned into the silent failure boogieman.
                    </p>

                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 my-4">
                      <p className="font-medium text-white mb-3">Validation Checklist:</p>
                      <ul className="space-y-2">
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-400">•</span>
                          <span>Schema Compliance: Verified all critical fields (Writer__c, body__c, Case__c, Summary__c, etc.) exist with expected types across Case and Case_Reply__c</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-400">•</span>
                          <span>Referential Integrity: Ensured every Case__c field maps to a valid Case ID in Salesforce</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-400">•</span>
                          <span>Text Fidelity: Compared stitched case conversations from the export to live Salesforce replies and descriptions to catch gaps or mismatches</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-400">•</span>
                          <span>Enrichment Coverage: Confirmed all enriched fields (Summary__c, Sentiment__c, etc.) are populated post-processing</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-400">•</span>
                          <span>Semantic Sanity Checks: Used vector similarity to flag replies in the export that didn't match Salesforce records, not just exact text, but meaning</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <span className="text-emerald-400">•</span>
                          <span>Manual Spot Checks: Reviewed samples for formatting, tone, and logical coherence to validate downstream usefulness</span>
                        </li>
                      </ul>
                    </div>

                    <p>
                      So, basically, no guesstimating. I pulled the schema definitions directly from Salesforce’s metadata API. Every required field - Writer__c, body__c, Case__c, Summary__c, Sentiment__c, and the rest was validated for both presence and type. If the docs said “textarea” but the metadata said “string,” that field was flagged.
                    </p>
                    <p>
                      Then came the reality check. I took a stitched export of case conversations from the CSV, pulled their counterparts from Salesforce, and ran semantic diffing using SentenceTransformer. It wasn’t enough to match words. I needed to know if the meaning aligned.
                    </p>
                    <p>
                      Next was enrichment coverage. I queried Salesforce directly to confirm fields like Summary__c, Sentiment__c, and Suggested_Solution__c were actually populated post-processing. Any blanks? The case got flagged and logged.
                    </p>
                    <p>
                      Finally, I sampled records manually to perform a gut-check for tone, coherence, and utility. Some of the questions I asked myself: Was the summary readable? Did the sentiment match? Could someone downstream act on the Next Best Action, or would they be left guessing?
                    </p>

                    <h5 className="font-semibold text-white mt-8 mb-4">Automated Message & Bot Case Detection</h5>

                    <p>
                      Some tickets weren't real. They were artifacts: dumped by internal tools, monitoring systems, or automation pipelines with a taste for support queues.
                    </p>

                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 my-4">
                      <p className="font-medium text-white mb-3">Bot Detection Systems:</p>
                      <ul className="space-y-4">
                        <li>
                          <p className="text-white mb-1">Bot Pattern Detection:</p>
                          <p>A script scanned for repeating templates and robotic phrasing using fuzzy matching and trigram scoring. If 50 tickets said the exact same thing about CVE-X, they weren't humans.</p>
                        </li>
                        <li>
                          <p className="text-white mb-1">Suspicious Keywords:</p>
                          <p>Phrases like "Request submitted for integrating CVE-2025-24786 detection" or "Create a detection for CVE-X" were telltale signs. These tickets weren't conversations; they were automated messages.</p>
                        </li>
                        <li>
                          <p className="text-white mb-1">Reply Patterns:</p>
                          <p>If a case had no replies, or just one auto-generated escalation note from the agent side, it got flagged. These weren't real support dialogues. They were ghosts in the system.</p>
                        </li>
                      </ul>
                    </div>
                    <p>
                      Instead of trying to enrich these zombies, I gave them a polite label: "automated placeholders" and steered them away from downstream modeling.
                    </p>

                    <p>
                      When mismatches cropped up: missing replies, misaligned text, or agent comments in Excel that didn't exist in Salesforce, I flagged them with a diffing script. Normalization, whitespace stripping, fuzzy comparison. Anything it couldn't reconcile, it escalated.
                    </p>

                    <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3 my-4 font-mono">
                      <code className="text-sm text-gray-300">
                        $ python validate.py --samples
                        <br />
                        $ python validate.py --validate-texts
                      </code>
                    </div>

                    <p>
                      For minor issues like broken encoding or missing sentiment, I used a micro-patch script. Clean changes, surgical precision. Original formatting untouched.
                    </p>

                    <p>
                      For accountability, I kept a fallback log: a local map of every case I manually touched. But I didn't include that in the CSV. The model didn't need to know. It just needed clean fuel.
                    </p>

                    <p>
                      It wasn't glamorous work. But it was necessary. LLMs can do many things. Fixing your data pipeline isn't one of them.
                    </p>

                    <p>
                      So before any models were called, before any tokens were sentenced to crash and burn, I made sure the substrate was clean.
                    </p>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none space-y-6">
                  <h4 className="font-semibold text-white text-lg">
                    Step 2: Begone, Hallucinating Token-Wasting Demons
                  </h4>

                  <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                    <p>
                      Before calling on GPT to perform any enrichment, I built a pre-processing pipeline whose sole purpose was to keep the noise out. Not every case deserves compute. Not every blob of text is worth a token.
                    </p>

                    <p>
                      Some conversations are rich with context - back-and-forths between customers and agents, upgrades gone sideways, logs and config fragments flying around. Others are just canned updates, contact info, recycled complaints, and placeholders soaked in email footers. If I let all of that through, GPT would hallucinate, overfit, or worse, turn verbose nothingness into a sentiment rating.
                    </p>

                    <p className="text-emerald-400 font-medium">
                      So this step is about filtration.
                    </p>

                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 my-4">
                      <p className="font-medium text-white mb-3">Pre-Processing Pipeline:</p>
                      <ul className="space-y-4">
                        <li>
                          <p className="text-white mb-1">Auto-Generated Content Detection:</p>
                          <p>Using pattern heuristics and fuzzy match scoring, I flagged anything that read like a robot. Phrases like "create detection for CVE" or "opened on behalf of" popped up across dozens of cases, sometimes copy-pasted with zero variation. If a case had no replies, or only one agent reply that looked like a template, it got flagged.</p>
                        </li>
                        <li>
                          <p className="text-white mb-1">Token Optimization:</p>
                          <p>I did not want token-bloat from email footers, base64 images, HTML signatures, or internal compliance taglines. So I stripped them out. That includes all the "register for Compass" spam and ten variations of "User Name" masquerading as a person.</p>
                        </li>
                        <li>
                          <p className="text-white mb-1">Structural Viability Check:</p>
                          <p>Was there actually enough conversational depth to make enrichment meaningful? Did the reply history contain actions, follow-ups, escalation evidence? Or was it just a PDF link and a vague complaint? If the latter, it was tagged low-priority or skipped entirely.</p>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="prose prose-sm max-w-none space-y-6">
                  <h4 className="font-semibold text-white text-lg">
                    Step 3: Frankenstitch the Threads
                  </h4>

                  <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                    <p>
                      Before any enrichment magic could happen, I had to do something unspeakably dull but totally critical: stitch the mess into readable conversations. Because GPT isn't going to parse spreadsheets with one-liner comments scattered across rows like post-it notes at a crime scene.
                    </p>

                    <p>
                      This step took raw case comment logs, the kind exported straight out of Salesforce and destined for confusion, and turned them into coherent, per-case conversation blocks. Think of it like building a chat transcript for each ticket. One line per speaker wasn't going to cut it. I needed narrative flow.
                    </p>

                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 my-4">
                      <p className="font-medium text-white mb-3">Conversation Stitching Process:</p>
                      <ul className="space-y-4">
                        <li>
                          <p className="text-white mb-1">Column Normalization:</p>
                          <p>Header chaos? Fixed. "parentid" became "caseid" because that's what it actually was. Then I checked for required fields because this isn't kindergarten and we don't work with half-complete data.</p>
                        </li>
                        <li>
                          <p className="text-white mb-1">Comment Grouping:</p>
                          <p>All comments with the same case ID got lumped together and glued into a single text blob, joined with line breaks. No timestamps, no formatting frills, just raw turn-taking approximated by newline characters. It wasn't beautiful, but it gave GPT something to chew on that didn't taste like Excel.</p>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-4 my-4">
                      <p className="text-white mb-2">Final Result:</p>
                      <p className="text-gray-400">
                        By the end, each case had been folded into a single conversational unit. One row, one thread, no more scattered commentary pretending to be structure. Just raw inputs, stitched into shape and ready for whatever GPT hallucination came next.
                      </p>
                    </div>

                    <div className="prose prose-sm max-w-none space-y-6">
                      <h4 className="font-semibold text-white text-lg">
                        Step 4: GPT, the Wand-Keeper
                      </h4>

                      <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                        <p>
                          Once the conversations were cleaned, stitched, and semi-readable, it was time to hand them off to the model. But this wasn't improv night. The model wasn't being asked to riff, it had a job, and it had to follow instructions.
                        </p>
                        <p>
                          The prompt was strict. Five fields. JSON. No introductions, no markdown, no emotional monologues. Just structured output, shaped for reentry into Salesforce or whatever downstream thing was waiting.
                        </p>
                        <p>
                          To keep things on track, I built a parser that acted like airport security. If the model forgot a field, broke the format, or hallucinated a sixth answer about its childhood? It got flagged and skipped. No drama, just logs.
                        </p>
                        <p>
                          Each case went through the same steps: prep the input, send it through GPT, pull out the fields, validate them, and map them back to their Salesforce-friendly names. The temperature was kept low for consistency, and failures didn't break the flow, they just politely exited.
                        </p>
                      </div>
                    </div>

                    <div className="prose prose-sm max-w-none space-y-6">
                      <h4 className="font-semibold text-white text-lg">
                        Step 5: Evaluate the Alchemist's Work
                      </h4>

                      <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                        <p>
                          The model had spoken. But just because GPT gave me something doesn't mean I trusted it. This step was about catching silent failures before they became noisy ones downstream.
                        </p>
                        <p>
                          First, I ran a visual scan across a sample of enriched rows. Were summaries readable? Did the tone match the actual conversation? Were the fields even valid? When something looked off, it usually was. I flagged those cases for inspection and correction.
                        </p>
                        <p>
                          Then I ran a diff check between the raw input and the model's output. If GPT said a case was urgent, but the conversation was three lines of polite small talk, something had gone sideways. If a sentiment reason read like a bad improv monologue, it got tossed.
                        </p>
                        <p>
                          When fields were malformed, blank, or filled with nonsense, I patched what I could and skipped what I couldn't. A CLI tool made it easy to isolate anomalies, re-run specific cases, and log everything without blowing up the whole file.
                        </p>
                        <p>
                          The goal wasn't to audit every row. It was to build confidence. After all, the enrichment wasn't the end of the road - it was the data everyone else would rely on. I had to make sure the alchemist's work didn't turn the dataset to lead.
                        </p>
                        <div className="flex justify-center">
                          <img
                            src="/images/eval.png"
                            alt="Evaluation Workflow"
                            className="rounded-lg border border-gray-700/50 my-4 w-full max-w-2xl mx-auto cursor-zoom-in transition-transform hover:scale-105"
                            onClick={() => setIsEvalModalOpen(true)}
                          />
                        </div>
                        {isEvalModalOpen && (
                          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => setIsEvalModalOpen(false)}>
                            <img
                              src="/images/eval.png"
                              alt="Evaluation Workflow Enlarged"
                              className="rounded-lg border border-gray-700/50 max-h-[90vh] max-w-[90vw] shadow-2xl"
                              onClick={e => e.stopPropagation()}
                            />
                            <button
                              className="absolute top-6 right-6 text-white text-3xl font-bold bg-black/60 rounded-full px-3 py-1 hover:bg-black/80"
                              onClick={() => setIsEvalModalOpen(false)}
                              aria-label="Close"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="prose prose-sm max-w-none space-y-6">
                      <h4 className="font-semibold text-white text-lg">
                        Step 6: Merge the Data, Invoke the Archivists (FAISS + LangChain)
                      </h4>

                      <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                        <p>
                          Once enrichment was done, I joined the structured metadata with the original conversations to create a single, merged dataset. This wasn't just for safekeeping. The goal was to make it searchable by people who don't dream in SQL.
                        </p>
                        <p>
                          So I embedded the cleaned conversations using sentence transformers and stored them in a FAISS vector index. Then I layered LangChain on top to build a natural-language QA engine. Now you can ask questions like: Which cases were tagged as high urgency but had no suggested solution? What does a typical frustrated case summary look like? Show me upgrade-related issues with positive sentiment.
                        </p>
                        <p>
                          It's not just for support insights. It helps QA the model itself. You can pull up cases with weirdly optimistic summaries, confirm whether sentiment matches tone, or explore if GPT missed something obvious. This isn't a magic trick. It's a way to interact with the output, not just stare at CSVs and guess. When you want answers, the archivist is ready.
                        </p>
                      </div>
                    </div>

                    <div className="prose prose-sm max-w-none space-y-6">
                      <h4 className="font-semibold text-white text-lg">
                        Case In Point (But Make It Enriched)
                      </h4>

                      <div className="space-y-4 text-gray-300 text-sm leading-relaxed">
                        <p>
                          This tool was built to give the support engineering team at sorceress.io a sharper, more structured way to work with support data. It takes raw case logs, validates them, filters out the junk, enriches them with clean metadata, and makes the whole thing searchable via natural language. This fruitful collaboration was fueled by being connected to the beating heart of fast-paced and highly iterative teams. Whether engineers are debugging a stubborn issue or looking for patterns across past cases, they now have something better than scattered notes. They have a system that remembers, extracts, and helps them move faster.
                          </p>
                          <p><i>made with 💜 by the AI/ML team</i></p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}