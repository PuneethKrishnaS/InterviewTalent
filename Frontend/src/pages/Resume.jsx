import React, { useContext, useEffect, useState } from "react";
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
  Save,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
  Link,
  pdf, // Added PDF import
} from "@react-pdf/renderer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useResumeStore } from "@/components/store/resumeStore";
import { AuthContext } from "@/components/context/AuthContext";

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
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Helvetica",
    color: "#212121",
  },
  section: {
    marginBottom: 15,
  },
  heading: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#1565C0",
    borderBottomWidth: 2,
    borderBottomColor: "#BBDEFB",
    paddingBottom: 3,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  subheading: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 3,
    color: "#424242",
  },
  text: {
    fontSize: 10,
    marginBottom: 3,
    lineHeight: 1.4,
  },
  listItem: {
    fontSize: 10,
    marginBottom: 2,
    marginLeft: 12,
    lineHeight: 1.4,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bullet: {
    marginRight: 4,
    fontSize: 10,
  },
  header: {
    marginBottom: 5,
    textAlign: "left",
    paddingBottom: 10,
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#0D47A1",
  },
  contact: {
    fontSize: 9,
    color: "#757575",
    lineHeight: 1.4,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  contactItem: {
    marginRight: 12,
  },
  experienceItem: {
    marginBottom: 12,
  },
  experienceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  experienceTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333333",
  },
  experienceCompany: {
    fontSize: 10,
    color: "#616161",
  },
  experienceDates: {
    fontSize: 10,
    color: "#9E9E9E",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  skillBadge: {
    fontSize: 9,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  projectItem: {
    marginBottom: 12,
  },
  projectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  projectTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333333",
  },
  projectDates: {
    fontSize: 10,
    color: "#9E9E9E",
  },
  projectTech: {
    fontSize: 10,
    color: "#424242",
    marginBottom: 2,
  },
  projectLinks: {
    flexDirection: "row",
    marginTop: 2,
  },
  projectLink: {
    fontSize: 9,
    color: "#1E88E5",
    marginRight: 12,
    textDecoration: "underline",
  },
  languageItem: {
    fontSize: 10,
    marginBottom: 2,
    marginLeft: 12,
    lineHeight: 1.4,
  },
  achievementItem: {
    fontSize: 10,
    marginBottom: 4,
    marginLeft: 12,
    lineHeight: 1.4,
    flexDirection: "column",
  },
  achievementDescription: {
    marginBottom: 2,
  },
  achievementLink: {
    fontSize: 9,
    color: "#1E88E5",
    textDecoration: "underline",
  },
  educationMarks: {
    fontSize: 10,
    color: "#757575",
  },
  linkText: {
    color: "#1E88E5",
    textDecoration: "underline",
  },
});

// Resume Document Component for react-pdf
const MyResumeDocument = ({ data }) => (
  <Document>
    <Page size="A4" style={pdfStyles.page}>
      {/* Header */}
      <View style={pdfStyles.header}>
        <Text style={pdfStyles.name}>{data.personal.name}</Text>
        <View style={pdfStyles.contact}>
          <Text style={pdfStyles.contactItem}>{data.personal.email}</Text>
          <Text style={pdfStyles.contactItem}>{data.personal.phone}</Text>
          {data.personal.linkedin && (
            <Link
              src={`https://${data.personal.linkedin}`}
              style={pdfStyles.contactItem}
            >
              <Text style={pdfStyles.linkText}>LinkedIn</Text>
            </Link>
          )}
          {data.personal.github && (
            <Link
              src={`https://${data.personal.github}`}
              style={pdfStyles.contactItem}
            >
              <Text style={pdfStyles.linkText}>GitHub</Text>
            </Link>
          )}
        </View>
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
                  <View key={i} style={pdfStyles.listItem}>
                    <Text style={pdfStyles.bullet}>•</Text>
                    <Text>{line.replace(/^•\s*/, "")}</Text>
                  </View>
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
                <Text style={{ fontWeight: "bold" }}>Technologies:</Text>{" "}
                {project.technologies}
              </Text>

              {project.description &&
                project.description.split("\n").map((line, i) => (
                  <View key={i} style={pdfStyles.listItem}>
                    <Text style={pdfStyles.bullet}>•</Text>
                    <Text>{line.replace(/^•\s*/, "")}</Text>
                  </View>
                ))}
              {(project.liveLink || project.githubLink) && (
                <View style={pdfStyles.projectLinks}>
                  {project.liveLink && (
                    <Link src={project.liveLink} style={pdfStyles.projectLink}>
                      <Text>Live Demo</Text>
                    </Link>
                  )}
                  {project.githubLink && (
                    <Link
                      src={project.githubLink}
                      style={pdfStyles.projectLink}
                    >
                      <Text>GitHub</Text>
                    </Link>
                  )}
                </View>
              )}
            </View>
          ))}
        </View>
      )}
      {/* Achievements */}
      {data.achievements.length > 0 && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.heading}>Achievements</Text>
          {data.achievements.map((ach, index) => (
            <View key={ach.id || index} style={pdfStyles.achievementItem}>
              <Text style={pdfStyles.achievementDescription}>
                • {ach.description}
              </Text>
              {ach.documentLink && (
                <Link src={ach.documentLink} style={pdfStyles.achievementLink}>
                  <Text>View Document</Text>
                </Link>
              )}
            </View>
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
                {skill},
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
                    {skill},
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

  // Destructure state and actions from the Zustand store
  const {
    resumeData,
    showPdf,
    handleChange,
    addExperience,
    removeExperience,
    addEducation,
    removeEducation,
    addProject,
    removeProject,
    addAchievement,
    removeAchievement,
    moveItem,
    handleFetchGithubProjects,
    handleAIButtonClick,
    handleKeyDown,
    uploadToDataBase,
    fetchFromDB,
    loading,
  } = useResumeStore();

  const { user } = useContext(AuthContext);

  const handleDownloadPdf = async () => {
    try {
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

  const handleSavePdf = async () => {
    await uploadToDataBase(resumeData);
  };

  const [userPrompt, setUserPrompt] = useState(
    "Make my resume with ATS compactable for the job role of software engineer at Microsoft"
  );

  useEffect(() => {
    fetchFromDB();
  }, []);

  const handlePromptChange = (e) => {
    setUserPrompt(e.target.value);
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
            <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-150px)]">
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
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <form
                        onSubmit={(e) => e.preventDefault()}
                        className="space-y-4"
                      >
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={resumeData.personal.name || ""}
                            onChange={(e) =>
                              handleChange("personal", "name", e.target.value)
                            }
                            placeholder={`e.g., ${user.userName.first}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={resumeData.personal.email || ""}
                            onChange={(e) =>
                              handleChange("personal", "email", e.target.value)
                            }
                            placeholder={`e.g., ${user.email}`}
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={resumeData.personal.phone || ""}
                            onChange={(e) =>
                              handleChange("personal", "phone", e.target.value)
                            }
                            placeholder="e.g., +1234567890"
                          />
                        </div>
                        <div>
                          <Label htmlFor="linkedin">LinkedIn Profile URL</Label>
                          <Input
                            id="linkedin"
                            value={resumeData.personal.linkedin || ""}
                            onChange={(e) =>
                              handleChange(
                                "personal",
                                "linkedin",
                                e.target.value
                              )
                            }
                            placeholder="e.g., https://linkedin.com/in/johndoe"
                          />
                        </div>
                        <div>
                          <Label htmlFor="github">GitHub Profile URL</Label>
                          <Input
                            id="github"
                            value={resumeData.personal.github || ""}
                            onChange={(e) =>
                              handleChange("personal", "github", e.target.value)
                            }
                            placeholder="e.g., https://github.com/johndoe"
                          />
                        </div>
                      </form>
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
                        onClick={async () => {
                          await handleAIButtonClick(
                            "Summary",
                            resumeData.summary
                          );
                        }}
                        className="text-primary hover:text-primary/80"
                      >
                        <Sparkles className="h-4 w-4 mr-1" /> AI
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <Textarea
                        value={resumeData.summary}
                        onChange={(e) =>
                          handleChange("summary", "summary", e.target.value)
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
                          onClick={async () =>
                            await handleAIButtonClick(
                              "Experience",
                              resumeData.experience
                            )
                          }
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
                          className="hover:bg-secondary/80 text-secondary-foreground"
                        >
                          <Github className="h-4 w-4 mr-1" /> Fetch from GitHub
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            await handleAIButtonClick(
                              "Projects",
                              resumeData.projects
                            );
                          }}
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
                          onClick={() =>
                            handleAIButtonClick(
                              "Achievements",
                              resumeData.achievements
                            )
                          }
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
                              rows={2}
                            />
                          </div>
                          <div>
                            <Label htmlFor={`ach-link-${index}`}>
                              Document Link (e.g., certificate URL)
                            </Label>
                            <Input
                              id={`ach-link-${index}`}
                              value={ach.documentLink}
                              onChange={(e) =>
                                handleChange(
                                  "achievements",
                                  "documentLink",
                                  e.target.value,
                                  index
                                )
                              }
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
                  <div className="flex gap-4 flex-wrap ">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/80 cursor-pointer"
                        >
                          <Sparkles className="h-4 w-4 mr-1" /> AI
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            Use AI to Fine-Tune Your Resume
                          </DialogTitle>
                          <DialogDescription asChild>
                            <div className="space-y-4">
                              <p className="text-muted-foreground text-sm">
                                Enter your prompt to improve a specific section
                                of your resume. You can also choose from the
                                suggestions below.
                              </p>
                              <div className="space-y-2">
                                <label
                                  htmlFor="ai-prompt"
                                  className="text-sm font-medium"
                                >
                                  Your Custom Prompt:
                                </label>
                                <Textarea
                                  id="ai-prompt"
                                  placeholder="e.g., 'Rewrite my summary to be more concise and impactful.'"
                                  value={userPrompt}
                                  onChange={handlePromptChange}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">
                                  Suggestions:
                                </label>
                                <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1 mt-2">
                                  <li>
                                    Enhance my experience descriptions with
                                    stronger action verbs.
                                  </li>
                                  <li>
                                    Review my project section and suggest
                                    improvements for clarity.
                                  </li>
                                  <li>
                                    Rephrase my technical skills section to
                                    highlight my expertise in a specific area.
                                  </li>
                                  <li>
                                    Check for spelling and grammar mistakes
                                    throughout the resume.
                                  </li>
                                  <li>
                                    Write a professional summary based on my
                                    experience and skills.
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex justify-end mt-4">
                          <Button
                            onClick={() => {
                              handleAIButtonClick(
                                "FixEverything",
                                null,
                                resumeData,
                                userPrompt
                              );
                            }}
                            type="submit"
                            className="bg-primary hover:bg-primary/80"
                            disabled={userPrompt.trim().length === 0}
                          >
                            Apply Changes
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button
                      onClick={handleDownloadPdf}
                      size="sm"
                      className="bg-primary hover:bg-primary/80 cursor-pointer"
                    >
                      <Download className="h-4 w-4 mr-1" /> Download PDF
                    </Button>
                    <Button
                      onClick={handleSavePdf}
                      size="sm"
                      className="bg-primary hover:bg-primary/80 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-1" /> Loading...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-1" /> Save PDF
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                {loading ? (
                  <></>
                ) : (
                  <CardContent className="h-[700px] p-0 overflow-hidden">
                    <div className="h-full w-full overflow-hidden">
                      <ErrorBoundary>
                        {showPdf ? (
                          <PDFViewer
                            width="100%"
                            height="100%"
                            showToolbar={false}
                            className="overflow-hidden"
                          >
                            <MyResumeDocument data={resumeData} />
                          </PDFViewer>
                        ) : (
                          <div className="flex items-center justify-center h-full text-muted-foreground">
                            Updating preview...
                          </div>
                        )}
                      </ErrorBoundary>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
