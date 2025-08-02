import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainNavbar from "../components/global/MainNavbar";
import { Button } from "../components/ui/button";
import { ArrowLeftCircle, Sparkles, Github, Download } from "lucide-react"; // Added Download icon
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
  Font,
  pdf,
} from "@react-pdf/renderer"; // Added pdf for download
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// IMPORTANT: Removed Font.register for Inter and switched to 'Helvetica'
// This resolves the font loading error, as Helvetica is a built-in font in react-pdf.
// If you must use Inter, you would typically need to download the .ttf files
// for all required weights and styles (regular, italic, bold, bold-italic)
// and serve them from your own project assets, then register each one explicitly:
// Font.register({
//   family: 'Inter',
//   fonts: [
//     { src: '/fonts/Inter-Regular.ttf', fontWeight: 400 },
//     { src: '/fonts/Inter-Italic.ttf', fontStyle: 'italic', fontWeight: 400 },
//     { src: '/fonts/Inter-Bold.ttf', fontWeight: 700 },
//     { src: '/fonts/Inter-BoldItalic.ttf', fontStyle: 'italic', fontWeight: 700 },
//   ],
// });

// Styles for the PDF document
const pdfStyles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 30,
    fontFamily: "Helvetica", // Changed from 'Inter' to 'Helvetica'
    color: "#333333",
  },
  section: {
    marginBottom: 15,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#007bff", // Primary color for headings
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
    paddingBottom: 4,
  },
  subheading: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  text: {
    fontSize: 10,
    marginBottom: 2,
  },
  listItem: {
    fontSize: 10,
    marginBottom: 2,
    marginLeft: 10,
  },
  header: {
    marginBottom: 20,
    textAlign: "center",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#000000",
  },
  contact: {
    fontSize: 10,
    color: "#666666",
  },
  experienceItem: {
    marginBottom: 10,
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
  },
  experienceDates: {
    fontSize: 10,
    color: "#666666",
  },
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5,
  },
  skillBadge: {
    fontSize: 9,
    backgroundColor: "#E0E0E0",
    borderRadius: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginRight: 5,
    marginBottom: 5,
    color: "#555555",
  },
  projectItem: {
    marginBottom: 10,
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
    color: "#666666",
  },
  projectTech: {
    fontSize: 10,
    fontStyle: "italic",
    marginBottom: 2,
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
          {data.personal.linkedin} | {data.personal.github}
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
            <View key={index} style={pdfStyles.experienceItem}>
              <View style={pdfStyles.experienceHeader}>
                <Text style={pdfStyles.experienceTitle}>{exp.title}</Text>
                <Text style={pdfStyles.experienceDates}>
                  {exp.startDate} - {exp.endDate}
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
            <View key={index} style={pdfStyles.experienceItem}>
              <View style={pdfStyles.experienceHeader}>
                <Text style={pdfStyles.experienceTitle}>{edu.degree}</Text>
                <Text style={pdfStyles.experienceDates}>
                  {edu.startDate} - {edu.endDate}
                </Text>
              </View>
              <Text style={pdfStyles.experienceCompany}>
                {edu.institution}, {edu.location}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <View style={pdfStyles.section}>
          <Text style={pdfStyles.heading}>Projects</Text>
          {data.projects.map((project, index) => (
            <View key={index} style={pdfStyles.projectItem}>
              <View style={pdfStyles.projectHeader}>
                <Text style={pdfStyles.projectTitle}>{project.name}</Text>
                <Text style={pdfStyles.projectDates}>
                  {project.startDate} - {project.endDate}
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
        title: "Senior Software Engineer",
        company: "Tech Solutions Inc.",
        location: "San Francisco, CA",
        startDate: "Jan 2022",
        endDate: "Present",
        description:
          " Led development of scalable web applications using React and Node.js.\n Implemented RESTful APIs and integrated with various third-party services.\n Mentored junior developers and conducted code reviews.",
      },
      {
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
        degree: "M.S. in Computer Science",
        institution: "University of Tech",
        location: "City, State",
        startDate: "Sep 2018",
        endDate: "May 2020",
      },
      {
        degree: "B.S. in Software Engineering",
        institution: "State University",
        location: "City, State",
        startDate: "Sep 2015",
        endDate: "May 2019",
      },
    ],
    projects: [
      {
        name: "E-commerce Platform Redesign",
        startDate: "Mar 2023",
        endDate: "Jun 2023",
        technologies: "React, Redux, Node.js, Express, MongoDB",
        description:
          " Revamped existing e-commerce site with a modern UI/UX.\n Integrated Stripe for payment processing, increasing conversion by 15%.\n Developed custom API endpoints for product management.",
      },
      {
        name: "Personal Portfolio Website",
        startDate: "Jan 2024",
        endDate: "Feb 2024",
        technologies: "Next.js, Tailwind CSS, Vercel",
        description:
          " Designed and built a responsive personal portfolio to showcase projects and skills.\nImplemented SEO best practices for better search engine visibility.",
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
  });

  const handleChange = (section, field, value, index = null) => {
    setResumeData((prevData) => {
      if (index !== null) {
        const updatedArray = [...prevData[section]];
        updatedArray[index] = { ...updatedArray[index], [field]: value };
        return { ...prevData, [section]: updatedArray };
      } else if (section === "skills") {
        // For skills, assuming 'field' is 'technical' or 'soft'
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
  };

  const addExperience = () => {
    setResumeData((prevData) => ({
      ...prevData,
      experience: [
        ...prevData.experience,
        {
          title: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          description: "",
        },
      ],
    }));
  };

  const removeExperience = (index) => {
    setResumeData((prevData) => ({
      ...prevData,
      experience: prevData.experience.filter((_, i) => i !== index),
    }));
  };

  const addEducation = () => {
    setResumeData((prevData) => ({
      ...prevData,
      education: [
        ...prevData.education,
        {
          degree: "",
          institution: "",
          location: "",
          startDate: "",
          endDate: "",
        },
      ],
    }));
  };

  const removeEducation = (index) => {
    setResumeData((prevData) => ({
      ...prevData,
      education: prevData.education.filter((_, i) => i !== index),
    }));
  };

  const addProject = () => {
    setResumeData((prevData) => ({
      ...prevData,
      projects: [
        ...prevData.projects,
        {
          name: "",
          startDate: "",
          endDate: "",
          technologies: "",
          description: "",
        },
      ],
    }));
  };

  const removeProject = (index) => {
    setResumeData((prevData) => ({
      ...prevData,
      projects: prevData.projects.filter((_, i) => i !== index),
    }));
  };

  const handleFetchGithubProjects = () => {
    console.log("Fetching projects from GitHub (placeholder functionality)...");
    alert(
      "This feature would fetch your projects from GitHub. (Functionality not implemented)"
    );
  };

  const handleAIButtonClick = (sectionName) => {
    console.log(`AI optimization requested for ${sectionName} section.`);
    alert(
      `AI optimization for ${sectionName} is not yet implemented. This feature would help make your content ATS-friendly.`
    );
  };

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
      URL.revokeObjectURL(url); // Clean up the URL object
    } catch (error) {
      console.error("Error generating or downloading PDF:", error);
      alert("Failed to download PDF. Please try again.");
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
                  <TabsTrigger value="skills">Skills</TabsTrigger>
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
                    <CardHeader className="flex flex-row justify-between items-center">
                      <CardTitle className="text-lg">Experience</CardTitle>
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
                        className="text-primary hover:text-primary/80 ml-2"
                      >
                        <Sparkles className="h-4 w-4 mr-1" /> AI
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {resumeData.experience.map((exp, index) => (
                        <div
                          key={index}
                          className="border border-border p-4 rounded-md space-y-3 relative"
                        >
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeExperience(index)}
                            className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full"
                          >
                            X
                          </Button>
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
                    <CardHeader className="flex flex-row justify-between items-center">
                      <CardTitle className="text-lg">Education</CardTitle>
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
                        className="text-primary hover:text-primary/80 ml-2"
                      >
                        <Sparkles className="h-4 w-4 mr-1" /> AI
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {resumeData.education.map((edu, index) => (
                        <div
                          key={index}
                          className="border border-border p-4 rounded-md space-y-3 relative"
                        >
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeEducation(index)}
                            className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full"
                          >
                            X
                          </Button>
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
                          className="text-primary hover:text-primary/80 ml-2"
                        >
                          <Sparkles className="h-4 w-4 mr-1" /> AI
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {resumeData.projects.map((project, index) => (
                        <div
                          key={index}
                          className="border border-border p-4 rounded-md space-y-3 relative"
                        >
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeProject(index)}
                            className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full"
                          >
                            X
                          </Button>
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
                              rows={4}
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
                  {/* PDFViewer with `showToolbar={false}` to hide its UI */}
                  <PDFViewer width="100%" height="100%" showToolbar={false}>
                    <MyResumeDocument data={resumeData} />
                  </PDFViewer>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
