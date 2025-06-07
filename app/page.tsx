"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-orange-500" />
            <h1 className="text-3xl font-bold text-white dark:text-white">Easy Notes</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportNotes}
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-orange-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <label>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-orange-500"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </span>
              </Button>
              <input type="file" accept=".json" onChange={importNotes} className="hidden" />
            </label>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="border-gray-600 hover:bg-gray-800 hover:border-orange-500"
            >
              {darkMode ? <Sun className="h-4 w-4 text-orange-400" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-500">{notes.length}</div>
              <p className="text-sm text-gray-400">Total Notes</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-500">
                {notes.reduce((acc, note) => acc + note.tags.length, 0)}
              </div>
              <p className="text-sm text-gray-400">Total Tags</p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-500">{filteredNotes.length}</div>
              <p className="text-sm text-gray-400">Filtered Results</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Create */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            New Note
          </Button>

          <Modal isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} title="Create New Note">
            <div className="space-y-4">
              <Input
                placeholder="Note title..."
                value={newNote.title}
                onChange={(e) => setNewNote((prev) => ({ ...prev, title: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500"
              />
              <Textarea
                placeholder="Write your note here..."
                value={newNote.content}
                onChange={(e) => setNewNote((prev) => ({ ...prev, content: e.target.value }))}
                rows={6}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500"
              />
              <Input
                placeholder="Tags (comma separated)..."
                value={newNote.tags}
                onChange={(e) => setNewNote((prev) => ({ ...prev, tags: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button onClick={createNote} className="bg-orange-600 hover:bg-orange-700 text-white">
                  Create Note
                </Button>
              </div>
            </div>
          </Modal>
        </div>

        {/* Notes Grid */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">{searchTerm ? "No notes found" : "No notes yet"}</h3>
            <p className="text-gray-500">
              {searchTerm ? "Try adjusting your search terms" : "Create your first note to get started"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <Card
                key={note.id}
                className="hover:shadow-lg hover:shadow-orange-500/10 transition-all duration-200 bg-gray-800 border-gray-700 hover:border-orange-500/50"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg font-semibold line-clamp-2 text-white">{note.title}</CardTitle>
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-orange-400 hover:bg-gray-700"
                        onClick={() => {
                          setEditingNote(note)
                          setIsEditDialogOpen(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-gray-700"
                        onClick={() => deleteNote(note.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 text-sm line-clamp-3 mb-4">{note.content || "No content"}</p>

                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {note.tags.map((tag, index) => (
                        <Badge key={index} className="text-xs bg-orange-600/20 text-orange-300 border-orange-600/30">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="text-xs text-gray-500">
                    <div>Created: {formatDate(note.createdAt)}</div>
                    {note.updatedAt.getTime() !== note.createdAt.getTime() && (
                      <div>Updated: {formatDate(note.updatedAt)}</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Modal isOpen={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} title="Edit Note">
          {editingNote && (
            <div className="space-y-4">
              <Input
                placeholder="Note title..."
                value={editingNote.title}
                onChange={(e) => setEditingNote((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500"
              />
              <Textarea
                placeholder="Write your note here..."
                value={editingNote.content}
                onChange={(e) => setEditingNote((prev) => (prev ? { ...prev, content: e.target.value } : null))}
                rows={6}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500"
              />
              <Input
                placeholder="Tags (comma separated)..."
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
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500"
              />
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button onClick={updateNote} className="bg-orange-600 hover:bg-orange-700 text-white">
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  )
}
