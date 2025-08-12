import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/global/MainNavbar";
import { Button } from "../components/ui/button";
import {
  ArrowLeftCircle,
  Sparkles,
  Github,
  Download,
  ArrowUp,
  ArrowDown,
  Trash2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Label } from "../components/ui/label";
import {
  PDFViewer,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { v4 as uuidv4 } from "uuid";

// Error Boundary Component to catch PDF rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-red-500 p-4">
          <h2>PDF Preview Failed</h2>
          <p>
            {this.state.error?.message ||
              "An error occurred while generating the PDF."}
          </p>
          <p>Try refreshing or checking your data.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// Helper function to format date
const formatDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return dateString;
  }

  const options = { year: "numeric", month: "short" };
  return new Intl.DateTimeFormat("en-US", options).format(date);
};

// Styles for the PDF document
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#F9FAFB",
    padding: 40,
    fontFamily: "Helvetica",
    color: "#333333",
  },
  section: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1F2937",
    borderBottomWidth: 1.5,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 4,
    textTransform: "uppercase",
  },
  subheading: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#4B5563",
  },
  text: {
    fontSize: 10,
    marginBottom: 4,
    lineHeight: 1.5,
  },
  listItem: {
    fontSize: 10,
    marginBottom: 2,
    marginLeft: 10,
    lineHeight: 1.5,
  },
  header: {
    marginBottom: 25,
    textAlign: "center",
  },
  name: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#111827",
  },
  contact: {
    fontSize: 10,
    color: "#6B7280",
    lineHeight: 1.5,
  },
  experienceItem: {
    marginBottom: 15,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  experienceTitle: {
    fontSize: 12,
    fontWeight: "bold",
  },
  experienceCompany: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#4B5563",
  },
  experienceDates: {
    fontSize: 10,
    color: "#6B7280",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  skillBadge: {
    fontSize: 9,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 6,
    color: "#4B5563",
  },
  projectItem: {
    marginBottom: 15,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  projectTitle: {
    fontSize: 12,
    fontWeight: "bold",
  },
  projectDates: {
    fontSize: 10,
    color: "#6B7280",
  },
  projectTech: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 2,
  },
  projectLink: {
    fontSize: 10,
    color: "#1F2937",
    marginBottom: 2,
    fontWeight: "bold",
  },
  languageItem: {
    fontSize: 10,
    marginBottom: 2,
    marginLeft: 10,
    lineHeight: 1.5,
  },
  achievementItem: {
    fontSize: 10,
    marginBottom: 2,
    marginLeft: 10,
    lineHeight: 1.5,
  },
  educationMarks: {
    fontSize: 10,
    fontStyle: "italic",
    color: "#6B7280",
  },
});

// Resume Document Component for react-pdf
const MyResumeDocument = ({ data }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      {/* Header */}
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.name}>{data.personal.name}</Text>
        <Text style={pdfStyles.contact}>
          {data.personal.email} | {data.personal.phone} |{" "}
          {data.personal.linkedin && (
            <Text src={`https://${data.personal.linkedin}`}>
              <Text style={pdfStyles.linkText}>LinkedIn</Text>
            </Text>
          )}
          {data.personal.linkedin && data.personal.github && " | "}
          {data.personal.github && (
            <Text src={`https://${data.personal.github}`}>
              <Text style={pdfStyles.linkText}>GitHub</Text>
            </Text>
          )}
        </Text>
      </View>
      {/* Summary */}
      {data.summary && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.heading}>Summary</Text>
          <Text style={pdfStyles.text}>{data.summary}</Text>
        </View>
      )}
      {/* Experience */}
      {data.experience.length > 0 && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.heading}>Experience</Text>
          {data.experience.map((exp, index) => (
            <View key={exp.id || index} style={pdfStyles.experienceItem}>
              <View style={pdfStyles.experienceHeader}>
                <Text style={pdfStyles.experienceTitle}>{exp.title}</Text>
                <Text style={pdfStyles.experienceDates}>
                  {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                </Text>
              </View>
              <Text style={pdfStyles.experienceCompany}>
                {exp.company}, {exp.location}
              </Text>
              {exp.description &&
                exp.description.split("\n").map((line, i) => (
                  <Text key={i} style={pdfStyles.listItem}>
                    {line}
                  </Text>
                ))}
            </View>
          ))}
        </View>
      )}
      {/* Education */}
      {data.education.length > 0 && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.heading}>Education</Text>
          {data.education.map((edu, index) => (
            <View key={edu.id || index} style={pdfStyles.experienceItem}>
              <View style={pdfStyles.experienceHeader}>
                <Text style={pdfStyles.experienceTitle}>{edu.degree}</Text>
                <Text style={pdfStyles.experienceDates}>
                  {formatDate(edu.startDate)} - {formatDate(edu.endDate)}
                </Text>
              </View>
              <Text style={pdfStyles.experienceCompany}>
                {edu.institution}, {edu.location}
              </Text>
              {edu.marks && (
                <Text style={pdfStyles.educationMarks}>{edu.marks}</Text>
              )}
            </View>
          ))}
        </View>
      )}
      {/* Projects */}
      {data.projects.length > 0 && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.heading}>Projects</Text>
          {data.projects.map((project, index) => (
            <View key={project.id || index} style={pdfStyles.projectItem}>
              <View style={pdfStyles.projectHeader}>
                <Text style={pdfStyles.projectTitle}>{project.name}</Text>
                <Text style={pdfStyles.projectDates}>
                  {formatDate(project.startDate)} -{" "}
                  {formatDate(project.endDate)}
                </Text>
              </View>
              <Text style={pdfStyles.projectTech}>
                Technologies: {project.technologies}
              </Text>

              {project.description &&
                project.description.split("\n").map((line, i) => (
                  <Text key={i} style={pdfStyles.listItem}>
                    {line}
                  </Text>
                ))}
            </View>
          ))}
        </View>
      )}
      {/* Achievements */}
      {data.achievements.length > 0 && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.heading}>Achievements</Text>
          {data.achievements.map((ach, index) => (
            <Text key={ach.id || index} style={pdfStyles.achievementItem}>
              • {ach.description}
            </Text>
          ))}
        </View>
      )}
      {/* Skills */}
      {data.skills.technical.length > 0 && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.heading}>Skills</Text>
          <Text style={pdfStyles.subheading}>Technical Skills:</Text>
          <View style={pdfStyles.skillsContainer}>
            {data.skills.technical.map((skill, index) => (
              <Text key={index} style={pdfStyles.skillBadge}>
                {skill}
              </Text>
            ))}
          </View>
          {data.skills.soft.length > 0 && (
            <>
              <Text style={[pdfStyles.subheading, { marginTop: 8 }]}>
                Soft Skills:
              </Text>
              <View style={pdfStyles.skillsContainer}>
                {data.skills.soft.map((skill, index) => (
                  <Text key={index} style={pdfStyles.skillBadge}>
                    {skill}
                  </Text>
                ))}
              </View>
            </>
          )}
        </View>
      )}
      {/* Languages */}
      {data.languages.length > 0 && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.heading}>Languages</Text>
          {data.languages.map((lang, index) => (
            <Text key={index} style={pdfStyles.languageItem}>
              • {lang}
            </Text>
          ))}
        </View>
      )}
    </Page>
  </Document>
);

export default function Resume() {
  const navigate = useNavigate();
  const [resumeData, setResumeData] = useState({
    personal: {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "123-456-7890",
      linkedin: "linkedin.com/in/johndoe",
      github: "github.com/johndoe",
    },
    summary:
      "Highly motivated software engineer with 5+ years of experience in full-stack development. Proficient in React, Node.js, and cloud platforms. Seeking to leverage technical skills and problem-solving abilities to contribute to innovative projects.",
    experience: [
      {
        id: uuidv4(),
        title: "Senior Software Engineer",
        company: "Tech Solutions Inc.",
        location: "San Francisco, CA",
        startDate: "Jan 2022",
        endDate: "Present",
        description:
          " Led development of scalable web applications using React and Node.js.\n Implemented RESTful APIs and integrated with various third-party services.\n Mentored junior developers and conducted code reviews.",
      },
      {
        id: uuidv4(),
        title: "Software Developer",
        company: "Innovate Corp.",
        location: "New York, NY",
        startDate: "Jul 2019",
        endDate: "Dec 2021",
        description:
          " Developed and maintained front-end features for e-commerce platform.\n Collaborated with UX/UI designers to translate wireframes into interactive components.\n Optimized application performance, reducing load times by 20%.",
      },
    ],
    education: [
      {
        id: uuidv4(),
        degree: "M.S. in Computer Science",
        institution: "University of Tech",
        location: "City, State",
        startDate: "Sep 2018",
        endDate: "May 2020",
        marks: "3.8/4.0 GPA",
      },
      {
        id: uuidv4(),
        degree: "B.S. in Software Engineering",
        institution: "State University",
        location: "City, State",
        startDate: "Sep 2015",
        endDate: "May 2019",
        marks: "3.8/4.0 GPA",
      },
    ],
    projects: [
      {
        id: uuidv4(),
        name: "E-commerce Platform Redesign",
        startDate: "Mar 2023",
        endDate: "Jun 2023",
        technologies: "React, Redux, Node.js, Express, MongoDB",
        description:
          " Revamped existing e-commerce site with a modern UI/UX.\n Integrated Stripe for payment processing, increasing conversion by 15%.\n Developed custom API endpoints for product management.",
        liveLink: "https://example.com/ecommerce",
        githubLink: "https://github.com/johndoe/ecommerce-redesign",
      },
      {
        id: uuidv4(),
        name: "Personal Portfolio Website",
        startDate: "Jan 2024",
        endDate: "Feb 2024",
        technologies: "Next.js, Tailwind CSS, Vercel",
        description:
          " Designed and built a responsive personal portfolio to showcase projects and skills.\nImplemented SEO best practices for better search engine visibility.",
        liveLink: "https://johndoe.com",
        githubLink: "https://github.com/johndoe/portfolio",
      },
    ],
    skills: {
      technical: [
        "JavaScript",
        "React",
        "Node.js",
        "Python",
        "SQL",
        "AWS",
        "Docker",
        "Git",
        "Tailwind CSS",
      ],
      soft: [
        "Problem Solving",
        "Teamwork",
        "Communication",
        "Leadership",
        "Adaptability",
      ],
    },
    languages: ["English (Fluent)", "Spanish (Conversational)"],
    achievements: [
      {
        id: uuidv4(),
        description:
          "Won the 'Best Innovator' award at the 2023 Hackathon for a new mobile app.",
      },
      {
        id: uuidv4(),
        description:
          "Published a research paper on machine learning in a peer-reviewed journal.",
      },
    ],
  });

  const [showPdf, setShowPdf] = useState(true);

  const handleChange = (section, field, value, index = null) => {
    setShowPdf(false);
    setResumeData((prevData) => {
      if (section === "languages") {
        return {
          ...prevData,
          languages: value
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s !== ""),
        };
      } else if (index !== null) {
        const updatedArray = [...prevData[section]];
        updatedArray[index] = { ...updatedArray[index], [field]: value };
        return { ...prevData, [section]: updatedArray };
      } else if (section === "skills") {
        return {
          ...prevData,
          skills: {
            ...prevData.skills,
            [field]: value
              .split(",")
              .map((s) => s.trim())
              .filter((s) => s !== ""),
          },
        };
      } else {
        return {
          ...prevData,
          [section]: { ...prevData[section], [field]: value },
        };
      }
    });
    setTimeout(() => setShowPdf(true), 100);
  };

  const addExperience = () => {
    setShowPdf(false);
    setResumeData((prevData) => ({
      ...prevData,
      experience: [
        ...prevData.experience,
        {
          id: uuidv4(),
          title: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    }));
    setTimeout(() => setShowPdf(true), 100);
  };

  const removeExperience = (id) => {
    setShowPdf(false);
    setResumeData((prevData) => ({
      ...prevData,
      experience: prevData.experience.filter((exp) => exp.id !== id),
    }));
    setTimeout(() => setShowPdf(true), 100);
  };

  const addEducation = () => {
    setShowPdf(false);
    setResumeData((prevData) => ({
      ...prevData,
      education: [
        ...prevData.education,
        {
          id: uuidv4(),
          degree: "",
          institution: "",
          location: "",
          startDate: "",
          endDate: "",
          marks: "",
        },
      ],
    }));
    setTimeout(() => setShowPdf(true), 100);
  };

  const removeEducation = (id) => {
    setShowPdf(false);
    setResumeData((prevData) => ({
      ...prevData,
      education: prevData.education.filter((edu) => edu.id !== id),
    }));
    setTimeout(() => setShowPdf(true), 100);
  };

  const addProject = () => {
    setShowPdf(false);
    setResumeData((prevData) => ({
      ...prevData,
      projects: [
        ...prevData.projects,
        {
          id: uuidv4(),
          name: "",
          startDate: "",
          endDate: "",
          technologies: "",
          description: "",
          liveLink: "",
          githubLink: "",
        },
      ],
    }));
    setTimeout(() => setShowPdf(true), 100);
  };

  const removeProject = (id) => {
    setShowPdf(false);
    setResumeData((prevData) => ({
      ...prevData,
      projects: prevData.projects.filter((project) => project.id !== id),
    }));
    setTimeout(() => setShowPdf(true), 100);
  };

  const addAchievement = () => {
    setShowPdf(false);
    setResumeData((prevData) => ({
      ...prevData,
      achievements: [
        ...prevData.achievements,
        { id: uuidv4(), description: "" },
      ],
    }));
    setTimeout(() => setShowPdf(true), 100);
  };

  const removeAchievement = (id) => {
    setShowPdf(false);
    setResumeData((prevData) => ({
      ...prevData,
      achievements: prevData.achievements.filter((ach) => ach.id !== id),
    }));
    setTimeout(() => setShowPdf(true), 100);
  };

  const moveItem = (section, index, direction) => {
    setShowPdf(false);
    setResumeData((prevData) => {
      const newArray = [...prevData[section]];
      const [movedItem] = newArray.splice(index, 1);
      const newIndex = direction === "up" ? index - 1 : index + 1;
      newArray.splice(newIndex, 0, movedItem);
      return {
        ...prevData,
        [section]: newArray,
      };
    });
    setTimeout(() => setShowPdf(true), 100);
  };

  const handleFetchGithubProjects = async () => {
    const username = prompt("Please enter your GitHub username:");
    if (!username) return;

    try {
      setShowPdf(false);
      const response = await fetch(
        `https://api.github.com/users/${username}/repos`
      );
      if (!response.ok) {
        throw new Error("User not found or an error occurred.");
      }
      const repos = await response.json();

      const newProjects = repos.map((repo) => ({
        id: uuidv4(),
        name: repo.name,
        startDate: new Date(repo.created_at).toLocaleDateString(),
        endDate: new Date(repo.updated_at).toLocaleDateString(),
        technologies: repo.language || "N/A",
        description: repo.description || "No description provided.",
        liveLink: "",
        githubLink: repo.html_url,
      }));

      setResumeData((prevData) => ({
        ...prevData,
        projects: [...prevData.projects, ...newProjects],
      }));

      alert(`Successfully fetched ${repos.length} projects from GitHub!`);
      setTimeout(() => setShowPdf(true), 100);
    } catch (error) {
      console.error("Error fetching projects from GitHub:", error);
      alert(error.message);
      setShowPdf(true);
    }
  };

  const handleAIButtonClick = (sectionName) => {
    console.log(`AI optimization requested for ${sectionName} section.`);
    alert(
      `AI optimization for ${sectionName} is not yet implemented. This feature would help make your content ATS-friendly.`
    );
  };

  const handleDownloadPdf = async () => {
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const blob = await pdf(<MyResumeDocument data={resumeData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${resumeData.personal.name.replace(
        /\s/g,
        "_"
      )}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error generating or downloading PDF:", error);
      alert("Failed to download PDF. Please try again.");
    }
  };

  const handleKeyDown = (e, section, field, index) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const textarea = e.target;
      const value = textarea.value;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newValue =
        value.substring(0, start) + "\n• " + value.substring(end);
      setShowPdf(false);
      setResumeData((prevData) => {
        const updatedArray = [...prevData[section]];
        updatedArray[index] = { ...updatedArray[index], [field]: newValue };
        return { ...prevData, [section]: updatedArray };
      });
      setTimeout(() => {
        setShowPdf(true);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
      }, 100);
    }
  };

  return (
    <div className="bg-background min-h-screen text-foreground font-inter">
      <MainNavbar />
      <div className="w-full">
        <div className="container mx-auto lg:px-8 px-5 py-8 md:py-12">
          {/* Top navigation */}
          <nav className="flex justify-between items-center mb-8">
            <Button
              variant={"link"}
              onClick={() => navigate("/dashboard")}
              className="cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <ArrowLeftCircle className="mr-2 h-5 w-5" />
              Back to Dashboard
            </Button>
            <div className="text-right">
              <h1 className="font-black text-xl md:text-2xl text-foreground">
                Resume Builder
              </h1>
              <p className="text-muted-foreground text-sm md:text-md">
                Create your professional resume
              </p>
            </div>
          </nav>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Input Form with Tabs */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <Tabs defaultValue="personal" className="w-full">
                <TabsList className="grid w-full grid-cols-3 md:grid-cols-4 lg:grid-cols-6 h-auto">
                  <TabsTrigger value="personal">Personal</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="projects">Projects</TabsTrigger>
                  <TabsTrigger value="achievements">Achievements</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                  <TabsTrigger value="languages">Languages</TabsTrigger>
                </TabsList>

                {/* Personal Information Tab */}
                <TabsContent value="personal">
                  <Card className="bg-card border border-border text-foreground">
                    <CardHeader className="flex flex-row justify-between items-center">
                      <CardTitle className="text-lg">
                        Personal Information
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleAIButtonClick("Personal Information")
                        }
                        className="text-primary hover:text-primary/80"
                      >
                        <Sparkles className="h-4 w-4 mr-1" /> AI
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          value={resumeData.personal.name}
                          onChange={(e) =>
                            handleChange("personal", "name", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={resumeData.personal.email}
                          onChange={(e) =>
                            handleChange("personal", "email", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={resumeData.personal.phone}
                          onChange={(e) =>
                            handleChange("personal", "phone", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                        <Input
                          id="linkedin"
                          value={resumeData.personal.linkedin}
                          onChange={(e) =>
                            handleChange("personal", "linkedin", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="github">GitHub Profile URL</Label>
                        <Input
                          id="github"
                          value={resumeData.personal.github}
                          onChange={(e) =>
                            handleChange("personal", "github", e.target.value)
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Summary Tab */}
                <TabsContent value="summary">
                  <Card className="bg-card border border-border text-foreground">
                    <CardHeader className="flex flex-row justify-between items-center">
                      <CardTitle className="text-lg">
                        Summary / Objective
                      </CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAIButtonClick("Summary")}
                        className="text-primary hover:text-primary/80"
                      >
                        <Sparkles className="h-4 w-4 mr-1" /> AI
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={resumeData.summary}
                        onChange={(e) =>
                          setResumeData((prev) => ({
                            ...prev,
                            summary: e.target.value,
                          }))
                        }
                        rows={5}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Experience Tab */}
                <TabsContent value="experience">
                  <Card className="bg-card border border-border text-foreground">
                    <CardHeader className="flex justify-between items-center">
                      <CardTitle className="text-lg">Experience</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          onClick={addExperience}
                          size="sm"
                          className="bg-primary hover:bg-primary/80"
                        >
                          Add Experience
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAIButtonClick("Experience")}
                          className="text-primary hover:text-primary/80"
                        >
                          <Sparkles className="h-4 w-4 mr-1" /> AI
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {resumeData.experience.map((exp, index) => (
                        <div
                          key={exp.id}
                          className="border border-border p-4 rounded-md space-y-3 relative"
                        >
                          <div className="absolute top-2 right-2 flex gap-1 items-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                moveItem("experience", index, "up")
                              }
                              disabled={index === 0}
                              className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                moveItem("experience", index, "down")
                              }
                              disabled={
                                index === resumeData.experience.length - 1
                              }
                              className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExperience(exp.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:bg-red-500/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div>
                            <Label htmlFor={`exp-title-${index}`}>
                              Job Title
                            </Label>
                            <Input
                              id={`exp-title-${index}`}
                              value={exp.title}
                              onChange={(e) =>
                                handleChange(
                                  "experience",
                                  "title",
                                  e.target.value,
                                  index
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor={`exp-company-${index}`}>
                              Company
                            </Label>
                            <Input
                              id={`exp-company-${index}`}
                              value={exp.company}
                              onChange={(e) =>
                                handleChange(
                                  "experience",
                                  "company",
                                  e.target.value,
                                  index
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor={`exp-location-${index}`}>
                              Location
                            </Label>
                            <Input
                              id={`exp-location-${index}`}
                              value={exp.location}
                              onChange={(e) =>
                                handleChange(
                                  "experience",
                                  "location",
                                  e.target.value,
                                  index
                                )
                              }
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`exp-start-${index}`}>
                                Start Date
                              </Label>
                              <Input
                                id={`exp-start-${index}`}
                                value={exp.startDate}
                                onChange={(e) =>
                                  handleChange(
                                    "experience",
                                    "startDate",
                                    e.target.value,
                                    index
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor={`exp-end-${index}`}>
                                End Date
                              </Label>
                              <Input
                                id={`exp-end-${index}`}
                                value={exp.endDate}
                                onChange={(e) =>
                                  handleChange(
                                    "experience",
                                    "endDate",
                                    e.target.value,
                                    index
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`exp-desc-${index}`}>
                              Description (one point per line)
                            </Label>
                            <Textarea
                              id={`exp-desc-${index}`}
                              value={exp.description}
                              onChange={(e) =>
                                handleChange(
                                  "experience",
                                  "description",
                                  e.target.value,
                                  index
                                )
                              }
                              onKeyDown={(e) =>
                                handleKeyDown(
                                  e,
                                  "experience",
                                  "description",
                                  index
                                )
                              }
                              rows={4}
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Education Tab */}
                <TabsContent value="education">
                  <Card className="bg-card border border-border text-foreground">
                    <CardHeader className="flex justify-between items-center">
                      <CardTitle className="text-lg">Education</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          onClick={addEducation}
                          size="sm"
                          className="bg-primary hover:bg-primary/80"
                        >
                          Add Education
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAIButtonClick("Education")}
                          className="text-primary hover:text-primary/80"
                        >
                          <Sparkles className="h-4 w-4 mr-1" /> AI
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {resumeData.education.map((edu, index) => (
                        <div
                          key={edu.id}
                          className="border border-border p-4 rounded-md space-y-3 relative"
                        >
                          <div className="absolute top-2 right-2 flex gap-1 items-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveItem("education", index, "up")}
                              disabled={index === 0}
                              className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                moveItem("education", index, "down")
                              }
                              disabled={
                                index === resumeData.education.length - 1
                              }
                              className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeEducation(edu.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:bg-red-500/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div>
                            <Label htmlFor={`edu-degree-${index}`}>
                              Degree
                            </Label>
                            <Input
                              id={`edu-degree-${index}`}
                              value={edu.degree}
                              onChange={(e) =>
                                handleChange(
                                  "education",
                                  "degree",
                                  e.target.value,
                                  index
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edu-institution-${index}`}>
                              Institution
                            </Label>
                            <Input
                              id={`edu-institution-${index}`}
                              value={edu.institution}
                              onChange={(e) =>
                                handleChange(
                                  "education",
                                  "institution",
                                  e.target.value,
                                  index
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor={`edu-location-${index}`}>
                              Location
                            </Label>
                            <Input
                              id={`edu-location-${index}`}
                              value={edu.location}
                              onChange={(e) =>
                                handleChange(
                                  "education",
                                  "location",
                                  e.target.value,
                                  index
                                )
                              }
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`edu-start-${index}`}>
                                Start Date
                              </Label>
                              <Input
                                id={`edu-start-${index}`}
                                value={edu.startDate}
                                onChange={(e) =>
                                  handleChange(
                                    "education",
                                    "startDate",
                                    e.target.value,
                                    index
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor={`edu-end-${index}`}>
                                End Date
                              </Label>
                              <Input
                                id={`edu-end-${index}`}
                                value={edu.endDate}
                                onChange={(e) =>
                                  handleChange(
                                    "education",
                                    "endDate",
                                    e.target.value,
                                    index
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor={`edu-marks-${index}`}>
                                Marks / CGPA / Percentage
                              </Label>
                              <Input
                                id={`edu-marks-${index}`}
                                value={edu.marks}
                                onChange={(e) =>
                                  handleChange(
                                    "education",
                                    "marks",
                                    e.target.value,
                                    index
                                  )
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Projects Tab */}
                <TabsContent value="projects">
                  <Card className="bg-card border border-border text-foreground">
                    <CardHeader className="flex flex-row justify-between items-center">
                      <CardTitle className="text-lg">Projects</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          onClick={addProject}
                          size="sm"
                          className="bg-primary hover:bg-primary/80"
                        >
                          Add Project
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleFetchGithubProjects}
                          className="bg-secondary hover:bg-secondary/80 text-secondary-foreground"
                        >
                          <Github className="h-4 w-4 mr-1" /> Fetch from GitHub
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAIButtonClick("Projects")}
                          className="text-primary hover:text-primary/80"
                        >
                          <Sparkles className="h-4 w-4 mr-1" /> AI
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {resumeData.projects.map((project, index) => (
                        <div
                          key={project.id}
                          className="border border-border p-4 rounded-md space-y-3 relative"
                        >
                          <div className="absolute top-2 right-2 flex gap-1 items-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => moveItem("projects", index, "up")}
                              disabled={index === 0}
                              className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                moveItem("projects", index, "down")
                              }
                              disabled={
                                index === resumeData.projects.length - 1
                              }
                              className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeProject(project.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:bg-red-500/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div>
                            <Label htmlFor={`project-name-${index}`}>
                              Project Name
                            </Label>
                            <Input
                              id={`project-name-${index}`}
                              value={project.name}
                              onChange={(e) =>
                                handleChange(
                                  "projects",
                                  "name",
                                  e.target.value,
                                  index
                                )
                              }
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor={`project-start-${index}`}>
                                Start Date
                              </Label>
                              <Input
                                id={`project-start-${index}`}
                                value={project.startDate}
                                onChange={(e) =>
                                  handleChange(
                                    "projects",
                                    "startDate",
                                    e.target.value,
                                    index
                                  )
                                }
                              />
                            </div>
                            <div>
                              <Label htmlFor={`project-end-${index}`}>
                                End Date
                              </Label>
                              <Input
                                id={`project-end-${index}`}
                                value={project.endDate}
                                onChange={(e) =>
                                  handleChange(
                                    "projects",
                                    "endDate",
                                    e.target.value,
                                    index
                                  )
                                }
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`project-tech-${index}`}>
                              Technologies (comma-separated)
                            </Label>
                            <Input
                              id={`project-tech-${index}`}
                              value={project.technologies}
                              onChange={(e) =>
                                handleChange(
                                  "projects",
                                  "technologies",
                                  e.target.value,
                                  index
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor={`project-live-${index}`}>
                              Live Link
                            </Label>
                            <Input
                              id={`project-live-${index}`}
                              value={project.liveLink}
                              onChange={(e) =>
                                handleChange(
                                  "projects",
                                  "liveLink",
                                  e.target.value,
                                  index
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor={`project-github-${index}`}>
                              GitHub Link
                            </Label>
                            <Input
                              id={`project-github-${index}`}
                              value={project.githubLink}
                              onChange={(e) =>
                                handleChange(
                                  "projects",
                                  "githubLink",
                                  e.target.value,
                                  index
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor={`project-desc-${index}`}>
                              Description (one point per line)
                            </Label>
                            <Textarea
                              id={`project-desc-${index}`}
                              value={project.description}
                              onChange={(e) =>
                                handleChange(
                                  "projects",
                                  "description",
                                  e.target.value,
                                  index
                                )
                              }
                              onKeyDown={(e) =>
                                handleKeyDown(
                                  e,
                                  "projects",
                                  "description",
                                  index
                                )
                              }
                              rows={4}
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Achievements Tab */}
                <TabsContent value="achievements">
                  <Card className="bg-card border border-border text-foreground">
                    <CardHeader className="flex justify-between items-center">
                      <CardTitle className="text-lg">Achievements</CardTitle>
                      <div className="flex gap-2">
                        <Button
                          onClick={addAchievement}
                          size="sm"
                          className="bg-primary hover:bg-primary/80"
                        >
                          Add Achievement
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAIButtonClick("Achievements")}
                          className="text-primary hover:text-primary/80"
                        >
                          <Sparkles className="h-4 w-4 mr-1" /> AI
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {resumeData.achievements.map((ach, index) => (
                        <div
                          key={ach.id}
                          className="border border-border p-4 rounded-md space-y-3 relative"
                        >
                          <div className="absolute top-2 right-2 flex gap-1 items-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                moveItem("achievements", index, "up")
                              }
                              disabled={index === 0}
                              className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                moveItem("achievements", index, "down")
                              }
                              disabled={
                                index === resumeData.achievements.length - 1
                              }
                              className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAchievement(ach.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:bg-red-500/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div>
                            <Label htmlFor={`ach-desc-${index}`}>
                              Description
                            </Label>
                            <Textarea
                              id={`ach-desc-${index}`}
                              value={ach.description}
                              onChange={(e) =>
                                handleChange(
                                  "achievements",
                                  "description",
                                  e.target.value,
                                  index
                                )
                              }
                              onKeyDown={(e) =>
                                handleKeyDown(
                                  e,
                                  "achievements",
                                  "description",
                                  index
                                )
                              }
                              rows={2}
                            />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Skills Tab */}
                <TabsContent value="skills">
                  <Card className="bg-card border border-border text-foreground">
                    <CardHeader className="flex flex-row justify-between items-center">
                      <CardTitle className="text-lg">Skills</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAIButtonClick("Skills")}
                        className="text-primary hover:text-primary/80"
                      >
                        <Sparkles className="h-4 w-4 mr-1" /> AI
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="technical-skills">
                          Technical Skills (comma-separated)
                        </Label>
                        <Input
                          id="technical-skills"
                          value={resumeData.skills.technical.join(", ")}
                          onChange={(e) =>
                            handleChange("skills", "technical", e.target.value)
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="soft-skills">
                          Soft Skills (comma-separated)
                        </Label>
                        <Input
                          id="soft-skills"
                          value={resumeData.skills.soft.join(", ")}
                          onChange={(e) =>
                            handleChange("skills", "soft", e.target.value)
                          }
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Languages Tab */}
                <TabsContent value="languages">
                  <Card className="bg-card border border-border text-foreground">
                    <CardHeader className="flex flex-row justify-between items-center">
                      <CardTitle className="text-lg">Languages</CardTitle>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAIButtonClick("Languages")}
                        className="text-primary hover:text-primary/80"
                      >
                        <Sparkles className="h-4 w-4 mr-1" /> AI
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <Label htmlFor="languages-list">
                        Languages (comma-separated)
                      </Label>
                      <Input
                        id="languages-list"
                        value={resumeData.languages.join(", ")}
                        onChange={(e) =>
                          handleChange("languages", null, e.target.value)
                        }
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column: PDF Preview */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              <Card className="bg-card border border-border text-foreground h-full">
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle className="text-lg">Resume Preview</CardTitle>
                  <Button
                    onClick={handleDownloadPdf}
                    size="sm"
                    className="bg-primary hover:bg-primary/80"
                  >
                    <Download className="h-4 w-4 mr-1" /> Download PDF
                  </Button>
                </CardHeader>
                <CardContent className="h-[700px] flex items-center justify-center p-0 overflow-hidden">
                  <ErrorBoundary>
                    {showPdf ? (
                      <PDFViewer width="100%" height="100%" showToolbar={false}>
                        <MyResumeDocument data={resumeData} />
                      </PDFViewer>
                    ) : (
                      <div className="text-muted-foreground">
                        Updating preview...
                      </div>
                    )}
                  </ErrorBoundary>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
