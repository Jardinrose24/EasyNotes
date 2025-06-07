"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { Plus, Search, Edit, Trash2, Moon, Sun, FileText, Download, Upload } from "lucide-react"
import { Modal } from "@/components/ui/modal"

interface Note {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
  tags: string[]
}

export default function EasyNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [newNote, setNewNote] = useState({ title: "", content: "", tags: "" })
  const [darkMode, setDarkMode] = useState(true)
  const { toast } = useToast()

  // Load notes from localStorage on component mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("easyNotes")
    const savedDarkMode = localStorage.getItem("easyNotesDarkMode")

    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }))
        setNotes(parsedNotes)
      } catch (error) {
        console.error("Error loading notes:", error)
      }
    }

    if (savedDarkMode !== null) {
      setDarkMode(JSON.parse(savedDarkMode))
    }
  }, [])

  // Save notes to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem("easyNotes", JSON.stringify(notes))
  }, [notes])

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem("easyNotesDarkMode", JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  const createNote = () => {
    if (!newNote.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your note.",
        variant: "destructive",
      })
      return
    }

    const note: Note = {
      id: Date.now().toString(),
      title: newNote.title,
      content: newNote.content,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: newNote.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
    }

    setNotes((prev) => [note, ...prev])
    setNewNote({ title: "", content: "", tags: "" })
    setIsCreateDialogOpen(false)

    toast({
      title: "Note created",
      description: "Your note has been saved successfully.",
    })
  }

  const updateNote = () => {
    if (!editingNote || !editingNote.title.trim()) {
      toast({
        title: "Error",
        description: "Please enter a title for your note.",
        variant: "destructive",
      })
      return
    }

    setNotes((prev) =>
      prev.map((note) => (note.id === editingNote.id ? { ...editingNote, updatedAt: new Date() } : note)),
    )
    setEditingNote(null)
    setIsEditDialogOpen(false)

    toast({
      title: "Note updated",
      description: "Your changes have been saved.",
    })
  }

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
    toast({
      title: "Note deleted",
      description: "The note has been removed.",
    })
  }

  const exportNotes = () => {
    const dataStr = JSON.stringify(notes, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `easy-notes-backup-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: "Notes exported",
      description: "Your notes have been downloaded as a backup file.",
    })
  }

  const importNotes = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedNotes = JSON.parse(e.target?.result as string).map((note: any) => ({
          ...note,
          createdAt: new Date(note.createdAt),
          updatedAt: new Date(note.updatedAt),
        }))
        setNotes((prev) => [...importedNotes, ...prev])
        toast({
          title: "Notes imported",
          description: `Successfully imported ${importedNotes.length} notes.`,
        })
      } catch (error) {
        toast({
          title: "Import failed",
          description: "The file format is not valid.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
    event.target.value = ""
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Navigation Bar */}
      <div className="glass-nav sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 glass-card flex items-center justify-center">
                <FileText className="h-5 w-5 text-orange-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Easy Notes</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={exportNotes}
                className="w-10 h-10 glass-button flex items-center justify-center text-gray-300 hover:text-orange-400 transition-all duration-300"
              >
                <Download className="h-4 w-4" />
              </button>
              <label>
                <div className="w-10 h-10 glass-button flex items-center justify-center text-gray-300 hover:text-orange-400 transition-all duration-300 cursor-pointer">
                  <Upload className="h-4 w-4" />
                </div>
                <input type="file" accept=".json" onChange={importNotes} className="hidden" />
              </label>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="w-10 h-10 glass-button flex items-center justify-center text-orange-400 hover:text-orange-300 transition-all duration-300"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 px-6 pb-24">
        {/* Search Bar */}
        <div className="py-6">
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-14 pl-12 pr-6 glass-input text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-300"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass-card p-5">
            <div className="text-3xl font-bold text-orange-400 mb-1">{notes.length}</div>
            <div className="text-sm text-gray-400">Notes</div>
          </div>
          <div className="glass-card p-5">
            <div className="text-3xl font-bold text-orange-400 mb-1">
              {notes.reduce((acc, note) => acc + note.tags.length, 0)}
            </div>
            <div className="text-sm text-gray-400">Tags</div>
          </div>
          <div className="glass-card p-5">
            <div className="text-3xl font-bold text-orange-400 mb-1">{filteredNotes.length}</div>
            <div className="text-sm text-gray-400">Results</div>
          </div>
        </div>

        {/* Notes List */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 glass-card flex items-center justify-center mx-auto mb-6">
              <FileText className="h-10 w-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-300 mb-3">
              {searchTerm ? "No notes found" : "No notes yet"}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? "Try adjusting your search terms" : "Tap the + button to create your first note"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map((note) => (
              <div key={note.id} className="glass-card p-6 hover:bg-white/10 transition-all duration-300 group">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white line-clamp-1 flex-1 group-hover:text-orange-100 transition-colors duration-300">
                    {note.title}
                  </h3>
                  <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={() => {
                        setEditingNote(note)
                        setIsEditDialogOpen(true)
                      }}
                      className="w-9 h-9 glass-button flex items-center justify-center text-gray-400 hover:text-orange-400 transition-all duration-300"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="w-9 h-9 glass-button flex items-center justify-center text-gray-400 hover:text-red-400 transition-all duration-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {note.content && (
                  <p className="text-gray-300 text-base line-clamp-3 mb-4 leading-relaxed">{note.content}</p>
                )}

                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {note.tags.map((tag, index) => (
                      <span key={index} className="px-3 py-1 glass-tag text-orange-300 text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{formatDate(note.createdAt)}</span>
                  {note.updatedAt.getTime() !== note.createdAt.getTime() && (
                    <span>Edited {formatDate(note.updatedAt)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-6 z-50">
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="w-16 h-16 glass-fab flex items-center justify-center text-white hover:scale-110 transition-all duration-300 group"
        >
          <Plus className="h-7 w-7 group-hover:rotate-90 transition-transform duration-300" />
        </button>
      </div>

      {/* Create Note Modal */}
      <Modal isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} title="New Note">
        <div className="space-y-5">
          <input
            type="text"
            placeholder="Title"
            value={newNote.title}
            onChange={(e) => setNewNote((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full h-14 px-5 glass-input text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-300"
          />
          <textarea
            placeholder="Write your note here..."
            value={newNote.content}
            onChange={(e) => setNewNote((prev) => ({ ...prev, content: e.target.value }))}
            rows={6}
            className="w-full px-5 py-4 glass-input text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-300 resize-none"
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={newNote.tags}
            onChange={(e) => setNewNote((prev) => ({ ...prev, tags: e.target.value }))}
            className="w-full h-14 px-5 glass-input text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-300"
          />
          <div className="flex gap-4 pt-3">
            <button
              onClick={() => setIsCreateDialogOpen(false)}
              className="flex-1 h-14 glass-button-secondary text-gray-300 font-semibold hover:text-white transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={createNote}
              className="flex-1 h-14 glass-button-primary text-white font-semibold hover:scale-105 transition-all duration-300"
            >
              Save Note
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Note Modal */}
      <Modal isOpen={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} title="Edit Note">
        {editingNote && (
          <div className="space-y-5">
            <input
              type="text"
              placeholder="Title"
              value={editingNote.title}
              onChange={(e) => setEditingNote((prev) => (prev ? { ...prev, title: e.target.value } : null))}
              className="w-full h-14 px-5 glass-input text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-300"
            />
            <textarea
              placeholder="Write your note here..."
              value={editingNote.content}
              onChange={(e) => setEditingNote((prev) => (prev ? { ...prev, content: e.target.value } : null))}
              rows={6}
              className="w-full px-5 py-4 glass-input text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-300 resize-none"
            />
            <input
              type="text"
              placeholder="Tags (comma separated)"
              value={editingNote.tags.join(", ")}
              onChange={(e) =>
                setEditingNote((prev) =>
                  prev
                    ? {
                        ...prev,
                        tags: e.target.value
                          .split(",")
                          .map((tag) => tag.trim())
                          .filter((tag) => tag),
                      }
                    : null,
                )
              }
              className="w-full h-14 px-5 glass-input text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-300"
            />
            <div className="flex gap-4 pt-3">
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="flex-1 h-14 glass-button-secondary text-gray-300 font-semibold hover:text-white transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={updateNote}
                className="flex-1 h-14 glass-button-primary text-white font-semibold hover:scale-105 transition-all duration-300"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
