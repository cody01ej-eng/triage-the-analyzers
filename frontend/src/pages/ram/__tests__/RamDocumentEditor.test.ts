import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, shallowMount, type VueWrapper } from '@vue/test-utils'
import ElementPlus from 'element-plus'
import RamDocumentEditor from '../RamDocumentEditor.vue'
import { findDocumentById, findDocumentSectionById } from '@/apis/ram'

// Only the external API and signed-in session are replaced. The component's
// watchers, Vue reactivity, and TipTap editor/commands run their real code.
vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { documentId: '1' }, query: {} }),
  useRouter: () => ({ push: vi.fn() })
}))
vi.mock('@/stores/userInfo', () => ({
  useUserInfoStore: () => ({ isInstructor: false, userInfo: { id: 1, teamId: 1 } })
}))
vi.mock('@/apis/ram', () => ({
  findDocumentById: vi.fn(),
  findDocumentSectionById: vi.fn(),
  getDocumentSectionLock: vi.fn(),
  lockDocumentSection: vi.fn(),
  unlockDocumentSection: vi.fn(),
  updateDocumentSection: vi.fn()
}))

const artifact = {
  id: 11,
  type: 'FUNCTIONAL_REQUIREMENT',
  artifactKey: 'FR-1',
  title: 'Save a draft',
  content: 'Members can save a draft.',
  priority: 'MEDIUM',
  sourceSectionId: 1,
  notes: ''
}

function section(content: string) {
  return {
    id: 1,
    sectionKey: 'scope',
    title: 'Scope',
    type: 'RICH_TEXT' as const,
    content,
    guidance: '',
    requirementArtifacts: [{ ...artifact }],
    lock: { locked: false, documentSectionId: 1 }
  }
}

let wrapper: VueWrapper

beforeEach(async () => {
  vi.mocked(findDocumentById).mockResolvedValue({
    flag: true,
    code: 200,
    message: 'Found document',
    data: {
      id: 1,
      teamId: 1,
      type: 'SRS',
      title: 'Software requirements',
      status: 'DRAFT',
      sections: [section('<p>Original content</p>')]
    }
  })
  vi.mocked(findDocumentSectionById).mockResolvedValue({
    flag: true,
    code: 200,
    message: 'Found section',
    data: section('<p>Original content</p>')
  })
  wrapper = shallowMount(RamDocumentEditor, {
    global: { plugins: [ElementPlus], renderStubDefaultSlot: true }
  })
  await flushPromises()
})

afterEach(() => {
  wrapper.unmount()
  vi.clearAllMocks()
})

describe('slice 9 editor regressions', () => {
  it('loads refreshed server content without emitting an edit, while user changes still emit', async () => {
    const vm = wrapper.vm as unknown as {
      editor: import('@tiptap/core').Editor
      refresh: () => void
    }
    const updated = vi.fn()
    vm.editor.on('update', updated)
    vi.mocked(findDocumentSectionById).mockResolvedValueOnce({
      flag: true,
      code: 200,
      message: 'Found section',
      data: section('<p>Refreshed content</p>')
    })

    vm.refresh()
    await flushPromises()

    expect(vm.editor.getHTML()).toBe('<p>Refreshed content</p>')
    expect(updated).not.toHaveBeenCalled()

    vm.editor.commands.insertContent('User edit')
    expect(vm.editor.getText()).toContain('User edit')
    expect(updated).toHaveBeenCalledTimes(1)
  })

  it('keeps the edit dialog closed when the selected artifact no longer exists', () => {
    const vm = wrapper.vm as unknown as {
      openEditArtifact: (index: number) => void
      artifactDialogVisible: boolean
      artifactEditingIndex: number | null
      artifactDraft: typeof artifact
    }
    const previousDraft = { ...vm.artifactDraft }

    vm.openEditArtifact(99)

    expect(vm.artifactDialogVisible).toBe(false)
    expect(vm.artifactEditingIndex).toBeNull()
    expect(vm.artifactDraft).toEqual(previousDraft)
  })

  it('opens a valid artifact as an independent draft', () => {
    const vm = wrapper.vm as unknown as {
      openEditArtifact: (index: number) => void
      artifactDialogVisible: boolean
      artifactEditingIndex: number | null
      artifactDraft: typeof artifact
      draftArtifacts: (typeof artifact)[]
    }

    vm.openEditArtifact(0)

    expect(vm.artifactDialogVisible).toBe(true)
    expect(vm.artifactEditingIndex).toBe(0)
    expect(vm.artifactDraft).toEqual(artifact)
    vm.artifactDraft.title = 'Unsaved edit'
    expect(vm.draftArtifacts[0]?.title).toBe('Save a draft')
  })
})
