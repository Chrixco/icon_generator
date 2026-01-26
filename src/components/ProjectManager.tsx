'use client'

import { useState, useEffect } from 'react'
import { IconProject, SavedIcon, projectUtils, ProjectSettings } from '@/utils/projectUtils'

interface ProjectManagerProps {
  onProjectSelect: (project: IconProject) => void
  onClose: () => void
  currentProject: IconProject | null
}

export default function ProjectManager({ onProjectSelect, onClose, currentProject }: ProjectManagerProps) {
  const [projects, setProjects] = useState<IconProject[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [newProjectDescription, setNewProjectDescription] = useState('')
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [importData, setImportData] = useState('')

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = () => {
    const allProjects = projectUtils.getAllProjects()
    setProjects(allProjects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()))
  }

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return

    const project = projectUtils.createProject(newProjectName.trim(), newProjectDescription.trim())
    projectUtils.setCurrentProject(project)
    onProjectSelect(project)
    loadProjects()

    setNewProjectName('')
    setNewProjectDescription('')
    setShowCreateForm(false)
  }

  const handleDeleteProject = (projectId: string) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      projectUtils.deleteProject(projectId)
      loadProjects()

      // If deleted project was current, clear current project
      if (currentProject?.id === projectId) {
        onProjectSelect(projects[0] || projectUtils.createProject('My First Project'))
      }
    }
  }

  const handleImportProject = () => {
    try {
      const project = projectUtils.importProject(importData)
      projectUtils.setCurrentProject(project)
      onProjectSelect(project)
      loadProjects()
      setImportData('')
      setShowImportDialog(false)
    } catch (error) {
      alert('Failed to import project: ' + (error as Error).message)
    }
  }

  const handleExportProject = (project: IconProject) => {
    try {
      const data = projectUtils.exportProject(project.id)
      const blob = new Blob([data], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${project.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_project.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      alert('Failed to export project: ' + (error as Error).message)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="fixed inset-0 bg-warmwood-900/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gradient-to-br from-cream-50 to-sage-50 rounded-2xl shadow-2xl border-2 border-sage-200 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-sage-200">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-sage-400 to-sage-600 rounded-xl mr-4 shadow-lg">
              <span className="text-xl">📁</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-warmwood-800">Project Manager</h2>
              <p className="text-warmwood-600 text-sm">Organize your magical icon collections</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-warmwood-600 hover:text-warmwood-800 hover:bg-warmwood-100 rounded-lg transition-all"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-b border-sage-200">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-sage-500 to-sage-600 text-cream-50 rounded-lg hover:from-sage-600 hover:to-sage-700 transition-all shadow-lg"
            >
              <span className="mr-2">✨</span>
              Create New Project
            </button>
            <button
              onClick={() => setShowImportDialog(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-sunset-500 to-sunset-600 text-cream-50 rounded-lg hover:from-sunset-600 hover:to-sunset-700 transition-all shadow-lg"
            >
              <span className="mr-2">📂</span>
              Import Project
            </button>
          </div>
        </div>

        {/* Create Project Form */}
        {showCreateForm && (
          <div className="p-6 border-b border-sage-200 bg-gradient-to-r from-sage-50 to-cream-100">
            <h3 className="text-lg font-bold text-warmwood-800 mb-4 flex items-center">
              <span className="mr-2">✨</span>
              Create New Project
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-warmwood-700 mb-2">Project Name</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="My Awesome Game Icons"
                  className="w-full p-3 border border-warmwood-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500 bg-cream-50"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warmwood-700 mb-2">Description (Optional)</label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  placeholder="Icons for my cozy village builder game..."
                  className="w-full p-3 border border-warmwood-300 rounded-lg focus:ring-2 focus:ring-sage-500 focus:border-sage-500 bg-cream-50 h-20 resize-none"
                  maxLength={500}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim()}
                  className="flex items-center px-4 py-2 bg-sage-600 text-cream-50 rounded-lg hover:bg-sage-700 disabled:bg-warmwood-300 disabled:cursor-not-allowed transition-all"
                >
                  <span className="mr-2">🎨</span>
                  Create Project
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-warmwood-600 hover:text-warmwood-800 hover:bg-warmwood-100 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Import Project Dialog */}
        {showImportDialog && (
          <div className="p-6 border-b border-sage-200 bg-gradient-to-r from-sunset-50 to-cream-100">
            <h3 className="text-lg font-bold text-warmwood-800 mb-4 flex items-center">
              <span className="mr-2">📂</span>
              Import Project
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-warmwood-700 mb-2">Project Data (JSON)</label>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  placeholder="Paste your exported project JSON data here..."
                  className="w-full p-3 border border-warmwood-300 rounded-lg focus:ring-2 focus:ring-sunset-500 focus:border-sunset-500 bg-cream-50 h-32 resize-none font-mono text-sm"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleImportProject}
                  disabled={!importData.trim()}
                  className="flex items-center px-4 py-2 bg-sunset-600 text-cream-50 rounded-lg hover:bg-sunset-700 disabled:bg-warmwood-300 disabled:cursor-not-allowed transition-all"
                >
                  <span className="mr-2">📥</span>
                  Import Project
                </button>
                <button
                  onClick={() => setShowImportDialog(false)}
                  className="px-4 py-2 text-warmwood-600 hover:text-warmwood-800 hover:bg-warmwood-100 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Projects List */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-warmwood-800 mb-6 flex items-center">
            <span className="mr-2">🗂️</span>
            Your Projects ({projects.length})
          </h3>

          {projects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-sage-200 to-sage-300 rounded-full flex items-center justify-center">
                <span className="text-3xl opacity-60">📁</span>
              </div>
              <h4 className="text-lg font-medium text-warmwood-800 mb-2">No Projects Yet</h4>
              <p className="text-warmwood-600 mb-4">Create your first project to start organizing your magical icons!</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-sage-500 to-sage-600 text-cream-50 rounded-lg hover:from-sage-600 hover:to-sage-700 transition-all shadow-lg"
              >
                <span className="mr-2">✨</span>
                Create Your First Project
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`p-6 rounded-xl border-2 transition-all cursor-pointer hover:shadow-lg ${
                    currentProject?.id === project.id
                      ? 'bg-gradient-to-br from-sage-50 to-sage-100 border-sage-400 shadow-sage-200'
                      : 'bg-gradient-to-br from-cream-50 to-cream-100 border-cream-300 hover:border-sage-300'
                  }`}
                  onClick={() => onProjectSelect(project)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start">
                      <div className={`w-10 h-10 rounded-lg mr-3 flex items-center justify-center ${
                        currentProject?.id === project.id
                          ? 'bg-sage-600 text-cream-50'
                          : 'bg-warmwood-600 text-cream-50'
                      }`}>
                        <span>🎨</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-warmwood-800 text-lg mb-1">{project.name}</h4>
                        {project.description && (
                          <p className="text-warmwood-600 text-sm mb-2 leading-relaxed">{project.description}</p>
                        )}
                        <div className="flex items-center text-xs text-warmwood-500 space-x-4">
                          <span className="flex items-center">
                            <span className="mr-1">🖼️</span>
                            {project.icons.length} icons
                          </span>
                          <span className="flex items-center">
                            <span className="mr-1">🕒</span>
                            {formatDate(project.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {currentProject?.id === project.id && (
                      <span className="px-2 py-1 bg-sage-600 text-cream-50 text-xs font-bold rounded-full">
                        Current
                      </span>
                    )}
                  </div>

                  {/* Project Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-warmwood-200">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleExportProject(project)
                        }}
                        className="flex items-center px-3 py-1.5 text-xs bg-sunset-100 text-sunset-700 rounded-lg hover:bg-sunset-200 transition-all"
                      >
                        <span className="mr-1">📤</span>
                        Export
                      </button>
                      {currentProject?.id !== project.id && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteProject(project.id)
                          }}
                          className="flex items-center px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all"
                        >
                          <span className="mr-1">🗑️</span>
                          Delete
                        </button>
                      )}
                    </div>
                    <span className="text-xs text-warmwood-500">
                      Created {formatDate(project.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}