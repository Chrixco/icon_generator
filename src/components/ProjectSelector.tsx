'use client'

import { useState, useEffect } from 'react'
import { IconProject, projectUtils } from '@/utils/projectUtils'

interface ProjectSelectorProps {
  currentProject: IconProject | null
  onProjectSelect: (project: IconProject) => void
  onOpenProjectManager: () => void
}

export default function ProjectSelector({ currentProject, onProjectSelect, onOpenProjectManager }: ProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [recentProjects, setRecentProjects] = useState<IconProject[]>([])

  useEffect(() => {
    const projects = projectUtils.getAllProjects()
    const sorted = projects.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    setRecentProjects(sorted.slice(0, 5)) // Show 5 most recent
  }, [currentProject])

  const handleQuickCreate = () => {
    const project = projectUtils.createProject(`Project ${Date.now()}`)
    projectUtils.setCurrentProject(project)
    onProjectSelect(project)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {/* Current Project Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-cream-100 to-sage-100 border-2 border-sage-200 rounded-xl hover:from-cream-200 hover:to-sage-200 hover:border-sage-300 transition-all shadow-lg"
      >
        <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-sage-500 to-sage-600 rounded-lg">
          <span className="text-sm">📁</span>
        </div>
        <div className="flex-1 text-left">
          <div className="font-bold text-warmwood-800 text-sm">
            {currentProject?.name || 'No Project Selected'}
          </div>
          <div className="text-xs text-warmwood-600">
            {currentProject ? `${currentProject.icons.length} icons` : 'Create or select a project'}
          </div>
        </div>
        <span className={`text-warmwood-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Menu */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-cream-50 to-sage-50 border-2 border-sage-200 rounded-xl shadow-2xl z-20 overflow-hidden">
            {/* Quick Actions */}
            <div className="p-4 border-b border-sage-200">
              <div className="flex gap-2">
                <button
                  onClick={handleQuickCreate}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-gradient-to-r from-sage-500 to-sage-600 text-cream-50 rounded-lg hover:from-sage-600 hover:to-sage-700 transition-all text-sm font-medium"
                >
                  <span className="mr-2">✨</span>
                  Quick Create
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    onOpenProjectManager()
                  }}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-gradient-to-r from-sunset-500 to-sunset-600 text-cream-50 rounded-lg hover:from-sunset-600 hover:to-sunset-700 transition-all text-sm font-medium"
                >
                  <span className="mr-2">🗂️</span>
                  Manage
                </button>
              </div>
            </div>

            {/* Recent Projects */}
            <div className="max-h-64 overflow-y-auto">
              {recentProjects.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-sage-200 to-sage-300 rounded-full flex items-center justify-center">
                    <span className="text-xl opacity-60">📁</span>
                  </div>
                  <h4 className="font-medium text-warmwood-800 mb-1">No Projects Yet</h4>
                  <p className="text-sm text-warmwood-600 mb-3">Create your first project to get started!</p>
                  <button
                    onClick={handleQuickCreate}
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-sage-500 to-sage-600 text-cream-50 rounded-lg hover:from-sage-600 hover:to-sage-700 transition-all text-sm font-medium"
                  >
                    <span className="mr-2">✨</span>
                    Create Project
                  </button>
                </div>
              ) : (
                <div className="p-2">
                  <div className="text-xs font-medium text-warmwood-700 px-3 py-2 mb-2 flex items-center">
                    <span className="mr-2">🕒</span>
                    Recent Projects
                  </div>
                  {recentProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        projectUtils.setCurrentProject(project)
                        onProjectSelect(project)
                        setIsOpen(false)
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-all text-left ${
                        currentProject?.id === project.id
                          ? 'bg-gradient-to-r from-sage-100 to-sage-200 text-sage-800'
                          : 'hover:bg-cream-100 text-warmwood-700'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${
                        currentProject?.id === project.id
                          ? 'bg-sage-600 text-cream-50'
                          : 'bg-warmwood-600 text-cream-50'
                      }`}>
                        🎨
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{project.name}</div>
                        <div className="text-xs opacity-75">
                          {project.icons.length} icons • {new Date(project.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      {currentProject?.id === project.id && (
                        <span className="text-sage-600 text-xs">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View All Link */}
            <div className="p-3 border-t border-sage-200 bg-gradient-to-r from-cream-100 to-sage-100">
              <button
                onClick={() => {
                  setIsOpen(false)
                  onOpenProjectManager()
                }}
                className="w-full text-center text-sm font-medium text-sage-700 hover:text-sage-800 transition-all"
              >
                View All Projects →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}