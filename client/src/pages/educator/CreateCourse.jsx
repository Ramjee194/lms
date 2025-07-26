import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUpload, FiPlus, FiX, FiChevronDown } from 'react-icons/fi';

const CreateCourse = () => {
  const navigate = useNavigate();
  const [course, setCourse] = useState({
    title: '',
    description: '',
    price: 0,
    discount: 0,
    category: 'web-development',
    level: 'beginner',
    thumbnail: null,
    thumbnailPreview: ''
  });

  const [chapters, setChapters] = useState([]);
  const [activeChapter, setActiveChapter] = useState(null);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showLectureModal, setShowLectureModal] = useState(false);
  const [lecture, setLecture] = useState({
    title: '',
    duration: 10,
    videoUrl: '',
    isPreview: false
  });

  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'thumbnail') {
      const file = files[0];
      setCourse({
        ...course,
        thumbnail: file,
        thumbnailPreview: URL.createObjectURL(file)
      });
    } else {
      setCourse({
        ...course,
        [name]: value
      });
    }
  };

  const addChapter = () => {
    const newChapter = {
      id: Date.now().toString(),
      title: `Chapter ${chapters.length + 1}`,
      lectures: []
    };
    setChapters([...chapters, newChapter]);
    setActiveChapter(newChapter.id);
    setShowChapterModal(true);
  };

  const saveChapter = (title) => {
    setChapters(chapters.map(ch => 
      ch.id === activeChapter ? { ...ch, title } : ch
    ));
    setShowChapterModal(false);
  };

  const addLecture = (chapterId) => {
    setActiveChapter(chapterId);
    setLecture({
      title: '',
      duration: 10,
      videoUrl: '',
      isPreview: false
    });
    setShowLectureModal(true);
  };

  const saveLecture = () => {
    if (!lecture.title) return;
    
    setChapters(chapters.map(chapter => {
      if (chapter.id === activeChapter) {
        return {
          ...chapter,
          lectures: [...chapter.lectures, {
            ...lecture,
            id: Date.now().toString()
          }]
        };
      }
      return chapter;
    }));
    setShowLectureModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Course submitted:', { ...course, chapters });
    // Here you would typically make an API call to save the course
    navigate('/educator/courses'); // Redirect after submission
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Create New Course</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Section */}
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Course Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block font-medium">Course Title*</label>
              <input
                type="text"
                name="title"
                value={course.title}
                onChange={handleChange}
                required
                className="w-full p-3 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g. Advanced React Development"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block font-medium">Category*</label>
              <select
                name="category"
                value={course.category}
                onChange={handleChange}
                className="w-full p-3 border rounded"
              >
                <option value="web-development">Web Development</option>
                <option value="mobile-development">Mobile Development</option>
                <option value="data-science">Data Science</option>
                <option value="business">Business</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block font-medium">Price (₹)*</label>
              <input
                type="number"
                name="price"
                value={course.price}
                onChange={handleChange}
                min="0"
                required
                className="w-full p-3 border rounded"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block font-medium">Discount (%)</label>
              <input
                type="number"
                name="discount"
                value={course.discount}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full p-3 border rounded"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block font-medium">Difficulty Level*</label>
              <select
                name="level"
                value={course.level}
                onChange={handleChange}
                className="w-full p-3 border rounded"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block font-medium">Course Thumbnail</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center justify-center w-32 h-20 border-2 border-dashed rounded-lg hover:bg-gray-50"
                >
                  {course.thumbnailPreview ? (
                    <img 
                      src={course.thumbnailPreview} 
                      alt="Preview" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="text-center">
                      <FiUpload className="mx-auto text-2xl text-gray-400" />
                      <p className="text-xs text-gray-500 mt-1">Upload Image</p>
                    </div>
                  )}
                </button>
                <input
                  type="file"
                  name="thumbnail"
                  ref={fileInputRef}
                  onChange={handleChange}
                  accept="image/*"
                  className="hidden"
                />
                {course.thumbnailPreview && (
                  <button
                    type="button"
                    onClick={() => setCourse({...course, thumbnail: null, thumbnailPreview: ''})}
                    className="text-red-500 hover:text-red-700"
                  >
                    <FiX className="text-xl" />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6 space-y-2">
            <label className="block font-medium">Description*</label>
            <textarea
              name="description"
              value={course.description}
              onChange={handleChange}
              required
              rows={6}
              className="w-full p-3 border rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Describe what students will learn in this course..."
            />
          </div>
        </section>
        
        {/* Curriculum Section */}
        <section className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Course Curriculum</h2>
            <button
              type="button"
              onClick={addChapter}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              <FiPlus /> Add Chapter
            </button>
          </div>
          
          {chapters.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-gray-500">No chapters added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chapters.map((chapter) => (
                <div key={chapter.id} className="border rounded-lg overflow-hidden">
                  <div className="flex justify-between items-center p-4 bg-gray-50">
                    <h3 className="font-medium">{chapter.title}</h3>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => addLecture(chapter.id)}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        + Add Lecture
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveChapter(chapter.id);
                          setShowChapterModal(true);
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setChapters(chapters.filter(ch => ch.id !== chapter.id))}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  
                  {chapter.lectures.length > 0 && (
                    <div className="p-4 space-y-2">
                      {chapter.lectures.map((lecture) => (
                        <div key={lecture.id} className="p-3 border rounded flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{lecture.title}</h4>
                            <p className="text-sm text-gray-600">
                              {lecture.duration} min • {lecture.isPreview ? 'Free Preview' : 'Paid'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="text-sm text-gray-600 hover:text-gray-800"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="text-sm text-red-600 hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
        
        {/* Submit Section */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/educator/courses')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Create Course
          </button>
        </div>
      </form>
      
      {/* Chapter Modal */}
      {showChapterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {chapters.find(ch => ch.id === activeChapter)?.title ? 'Edit Chapter' : 'Add Chapter'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Chapter Title*</label>
                <input
                  type="text"
                  value={chapters.find(ch => ch.id === activeChapter)?.title || ''}
                  onChange={(e) => {
                    const updatedChapters = chapters.map(ch => 
                      ch.id === activeChapter ? { ...ch, title: e.target.value } : ch
                    );
                    setChapters(updatedChapters);
                  }}
                  className="w-full p-3 border rounded"
                  autoFocus
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowChapterModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setShowChapterModal(false)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Lecture Modal */}
      {showLectureModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Lecture</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-medium mb-2">Lecture Title*</label>
                <input
                  type="text"
                  value={lecture.title}
                  onChange={(e) => setLecture({...lecture, title: e.target.value})}
                  className="w-full p-3 border rounded"
                  placeholder="Introduction to the Course"
                  autoFocus
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-2">Duration (min)*</label>
                  <input
                    type="number"
                    min="1"
                    value={lecture.duration}
                    onChange={(e) => setLecture({...lecture, duration: e.target.value})}
                    className="w-full p-3 border rounded"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-2">Video URL*</label>
                <input
                  type="url"
                  value={lecture.videoUrl}
                  onChange={(e) => setLecture({...lecture, videoUrl: e.target.value})}
                  className="w-full p-3 border rounded"
                  placeholder="https://example.com/video"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="preview"
                  checked={lecture.isPreview}
                  onChange={(e) => setLecture({...lecture, isPreview: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="preview">Available as free preview</label>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowLectureModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveLecture}
                  disabled={!lecture.title || !lecture.videoUrl}
                  className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 ${
                    (!lecture.title || !lecture.videoUrl) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  Add Lecture
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateCourse;